import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  Bike,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Crosshair,
  MapPin,
  Navigation,
  PackageCheck,
  Phone,
  RefreshCw,
  Route,
  Store,
  Wallet,
} from "lucide-react";
import { api } from "./api.ts";

const statusConfig = {
  COLETA: { label: "A caminho da loja", detail: "Vá até a Imperial para retirar o pedido." },
  NA_LOJA: { label: "Na loja", detail: "Retire e confira o pedido antes de sair." },
  EM_ROTA: { label: "Em rota", detail: "Siga até o endereço do cliente." },
  NO_DESTINO: { label: "No destino", detail: "Confirme a entrega após entregar o pedido." },
  ENTREGUE: { label: "Entrega concluída", detail: "Pedido finalizado com sucesso." },
  PROBLEMA: { label: "Problema informado", detail: "A operação foi avisada e acompanha o caso." },
  RETORNANDO: { label: "Retornando à loja", detail: "Siga de volta para a Imperial." },
  CANCELADO: { label: "Entrega cancelada", detail: "Esta entrega foi cancelada pela operação." },
};

const proximaEtapa = {
  COLETA: { status: "NA_LOJA", label: "Cheguei à loja", icon: Store },
  NA_LOJA: { status: "EM_ROTA", label: "Saí para entrega", icon: Bike },
  EM_ROTA: { status: "NO_DESTINO", label: "Cheguei ao destino", icon: MapPin },
  NO_DESTINO: { status: "ENTREGUE", label: "Confirmar entrega", icon: CheckCircle2 },
  PROBLEMA: { status: "EM_ROTA", label: "Retomar entrega", icon: RefreshCw },
};

const passos = [
  { chave: "COLETA", label: "Despacho" },
  { chave: "NA_LOJA", label: "Na loja" },
  { chave: "EM_ROTA", label: "Em rota" },
  { chave: "NO_DESTINO", label: "Destino" },
  { chave: "ENTREGUE", label: "Entregue" },
];

const ordemStatus = {
  COLETA: 0,
  NA_LOJA: 1,
  EM_ROTA: 2,
  NO_DESTINO: 3,
  ENTREGUE: 4,
};

function dinheiro(valor) {
  return Number(valor || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function hora(valor) {
  if (!valor) return "ainda não recebida";
  return new Date(valor).toLocaleString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function LoadingCard() {
  return <div className="rounded-3xl border border-white/10 bg-white/10 p-8 text-center text-white backdrop-blur">
    <RefreshCw className="mx-auto animate-spin" size={28} />
    <p className="mt-3 text-sm text-white/70">Carregando sua entrega...</p>
  </div>;
}

export default function PainelEntregador({ token }) {
  const [pedido, setPedido] = useState(null);
  const [erro, setErro] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const [gpsAtivo, setGpsAtivo] = useState(false);
  const [gpsStatus, setGpsStatus] = useState("GPS ainda não iniciado");
  const watchId = useRef(null);
  const ultimoEnvio = useRef(0);

  async function carregar(silencioso = false) {
    if (!silencioso) setErro("");
    try {
      setPedido(await api.getPainelEntregadorLogistica(token));
    } catch (error) {
      if (!silencioso) setErro(error?.message || "Não foi possível abrir esta entrega.");
    }
  }

  useEffect(() => {
    carregar();
    const timer = window.setInterval(() => carregar(true), 10_000);
    return () => window.clearInterval(timer);
  }, [token]);

  useEffect(() => () => {
    if (watchId.current != null && navigator.geolocation) {
      navigator.geolocation.clearWatch(watchId.current);
    }
  }, []);

  const status = statusConfig[pedido?.status] || {
    label: "Aguardando atualização",
    detail: "Consulte a operação para confirmar a etapa.",
  };
  const acao = proximaEtapa[pedido?.status];
  const indiceAtual = ordemStatus[pedido?.status] ?? 0;
  const enderecoCompleto = useMemo(() => {
    if (!pedido) return "";
    return [pedido.endereco, pedido.complemento, pedido.bairro].filter(Boolean).join(" · ");
  }, [pedido]);

  function iniciarGps() {
    if (!navigator.geolocation) {
      setFeedback({ tone: "red", text: "Este aparelho não oferece localização pelo navegador." });
      return;
    }
    setGpsStatus("Solicitando permissão de localização...");
    watchId.current = navigator.geolocation.watchPosition(
      async (posicao) => {
        setGpsAtivo(true);
        setGpsStatus(`Localização atualizada às ${new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`);
        if (Date.now() - ultimoEnvio.current < 8_000) return;
        ultimoEnvio.current = Date.now();
        try {
          await api.registrarLocalizacaoEntregadorLogistica(token, {
            latitude: posicao.coords.latitude,
            longitude: posicao.coords.longitude,
            precisaoMetros: posicao.coords.accuracy,
            velocidadeKmh: posicao.coords.speed == null
              ? undefined
              : Math.max(0, posicao.coords.speed * 3.6),
            direcaoGraus: posicao.coords.heading == null
              ? undefined
              : Math.max(0, posicao.coords.heading),
          });
        } catch (error) {
          setGpsStatus(error?.message || "Não foi possível enviar a localização.");
        }
      },
      (error) => {
        setGpsAtivo(false);
        setGpsStatus(
          error.code === 1
            ? "Permissão de localização negada. Libere o GPS nas configurações."
            : "Não foi possível obter sua localização agora.",
        );
      },
      { enableHighAccuracy: true, maximumAge: 5_000, timeout: 15_000 },
    );
  }

  async function atualizarEtapa(novaEtapa, descricao) {
    setEnviando(true);
    setFeedback(null);
    try {
      await api.atualizarEtapaEntregadorLogistica(token, {
        status: novaEtapa,
        descricao,
      });
      await carregar(true);
      setFeedback({
        tone: "green",
        text: novaEtapa === "ENTREGUE"
          ? "Entrega confirmada. Obrigado!"
          : "Etapa atualizada para a operação e para o cliente.",
      });
    } catch (error) {
      setFeedback({ tone: "red", text: error?.message || "Não foi possível avançar a entrega." });
    } finally {
      setEnviando(false);
    }
  }

  function informarProblema() {
    const descricao = window.prompt("Descreva brevemente o problema:");
    if (descricao?.trim()) atualizarEtapa("PROBLEMA", descricao.trim());
  }

  if (erro) {
    return <main className="min-h-screen bg-[#2B0005] px-4 py-10">
      <div className="mx-auto max-w-md rounded-3xl bg-white p-7 text-center shadow-2xl">
        <AlertTriangle className="mx-auto text-rose-600" size={34} />
        <h1 className="mt-4 text-xl font-bold text-slate-900">Link indisponível</h1>
        <p className="mt-2 text-sm text-slate-500">{erro}</p>
        <p className="mt-4 text-xs text-slate-400">Solicite um novo link à Imperial Parma.</p>
      </div>
    </main>;
  }

  return <main className="min-h-screen bg-slate-100 pb-28">
    <header className="bg-gradient-to-br from-[#2B0005] via-[#5B0712] to-[#7A1420] px-4 pb-16 pt-7 text-white">
      <div className="mx-auto max-w-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-red-200">Imperial Parma</p>
            <h1 className="mt-1 text-xl font-bold">Entrega do motorista</h1>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10"><Bike size={23} /></div>
        </div>
        {pedido && <div className="mt-7">
          <p className="font-mono text-xs text-red-200">{pedido.codigoPedido}</p>
          <h2 className="mt-1 text-2xl font-bold">{status.label}</h2>
          <p className="mt-1 text-sm text-white/70">{status.detail}</p>
        </div>}
      </div>
    </header>

    <div className="-mt-10 mx-auto flex max-w-lg flex-col gap-4 px-4">
      {!pedido ? <LoadingCard /> : <>
        <section className="rounded-3xl bg-white p-5 shadow-xl shadow-slate-300/40">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Rastreamento</p>
              <p className="mt-1 text-sm font-medium text-slate-700">{gpsStatus}</p>
            </div>
            <span className={`h-3 w-3 rounded-full ${gpsAtivo ? "animate-pulse bg-emerald-500" : "bg-slate-300"}`} />
          </div>
          {!gpsAtivo && !["ENTREGUE", "CANCELADO"].includes(pedido.status) && <button
            type="button"
            onClick={iniciarGps}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-sky-50 px-4 py-3 text-sm font-semibold text-sky-700"
          >
            <Crosshair size={17} /> Ativar GPS desta entrega
          </button>}
          <p className="mt-3 text-[11px] leading-relaxed text-slate-400">A localização é compartilhada somente enquanto esta página estiver aberta e a entrega estiver ativa.</p>
        </section>

        <section className="rounded-3xl bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Sua rota</p>
              <h3 className="mt-1 font-semibold text-slate-900">{pedido.rotaPedidos?.length || 1}/4 pedidos</h3>
            </div>
            {pedido.valorCorrida == null
              ? <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">Valor liberado após coleta</span>
              : <span className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-bold text-emerald-700">{dinheiro(pedido.valorCorrida)}</span>}
          </div>
          <div className="mt-4 space-y-2">
            {(pedido.rotaPedidos || []).map(item => (
              <div key={item.id} className={`flex items-center justify-between gap-3 rounded-2xl border p-3 ${item.codigoPedido === pedido.codigoPedido ? "border-red-200 bg-red-50/50" : "border-slate-100"}`}>
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase text-slate-400">Parada {item.ordemNaRota}</p>
                  <p className="truncate text-sm font-semibold text-slate-800">{item.codigoPedido} · {item.bairro}</p>
                </div>
                <span className="whitespace-nowrap text-xs font-semibold text-slate-600">{item.valorCorrida == null ? "após coleta" : dinheiro(item.valorCorrida)}</span>
              </div>
            ))}
          </div>
          {pedido.totalRota > 0 && <div className="mt-4 flex justify-between border-t border-slate-100 pt-3 text-sm"><span className="text-slate-500">Total liberado da rota</span><strong className="text-emerald-700">{dinheiro(pedido.totalRota)}</strong></div>}
        </section>

        <section className="rounded-3xl bg-white p-5 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <h3 className="font-semibold text-slate-900">Progresso</h3>
            <span className="text-xs text-slate-400">Atualizado {hora(pedido.atualizadoEm)}</span>
          </div>
          <div className="grid grid-cols-5 gap-1">
            {passos.map((passo, index) => {
              const concluido = index <= indiceAtual;
              return <div key={passo.chave} className="text-center">
                <div className={`mx-auto flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-bold ${concluido ? "bg-[#7A1420] text-white" : "bg-slate-100 text-slate-400"}`}>{concluido ? "✓" : index + 1}</div>
                <div className={`mx-auto mt-1 h-1 w-full rounded ${concluido ? "bg-[#7A1420]" : "bg-slate-100"}`} />
                <p className="mt-1 text-[9px] text-slate-400">{passo.label}</p>
              </div>;
            })}
          </div>
        </section>

        <section className="overflow-hidden rounded-3xl bg-white shadow-sm">
          <div className="border-b border-slate-100 p-5">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-red-50 text-[#7A1420]"><MapPin size={19} /></div>
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Destino</p>
                <p className="mt-1 font-semibold text-slate-900">{pedido.clienteNome}</p>
                <p className="mt-1 text-sm leading-relaxed text-slate-500">{enderecoCompleto}</p>
                {pedido.referencia && <p className="mt-1 text-xs text-slate-400">Referência: {pedido.referencia}</p>}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 divide-x divide-slate-100">
            <a href={pedido.navegacaoUrl} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 p-4 text-sm font-semibold text-[#7A1420]"><Navigation size={16} /> Abrir rota</a>
            {pedido.clienteTelefone
              ? <a href={`tel:${pedido.clienteTelefone}`} className="flex items-center justify-center gap-2 p-4 text-sm font-semibold text-slate-700"><Phone size={16} /> Ligar</a>
              : <span className="flex items-center justify-center gap-2 p-4 text-sm text-slate-300"><Phone size={16} /> Sem telefone</span>}
          </div>
        </section>

        <section className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-white p-4 shadow-sm"><Route size={17} className="text-sky-600" /><p className="mt-2 text-[10px] uppercase text-slate-400">Distância</p><p className="font-semibold text-slate-800">{Number(pedido.distanciaKm).toLocaleString("pt-BR")} km</p></div>
          <div className="rounded-2xl bg-white p-4 shadow-sm"><Wallet size={17} className="text-emerald-600" /><p className="mt-2 text-[10px] uppercase text-slate-400">Pagamento</p><p className="font-semibold text-slate-800">{pedido.formaPagamento}</p></div>
        </section>

        {pedido.formaPagamento === "DINHEIRO" && <section className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800"><Wallet size={16} className="mr-2 inline" />Cobrar {dinheiro(pedido.valorPedido)} do cliente.</section>}
        {pedido.observacoes && <section className="rounded-2xl bg-white p-4 text-sm text-slate-600 shadow-sm"><strong>Observações:</strong> {pedido.observacoes}</section>}
        {feedback && <div className={`rounded-2xl border p-4 text-sm ${feedback.tone === "green" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-rose-200 bg-rose-50 text-rose-700"}`}>{feedback.text}</div>}
      </>}
    </div>

    {pedido && !["ENTREGUE", "CANCELADO"].includes(pedido.status) && <footer className="fixed inset-x-0 bottom-0 z-20 border-t border-slate-200 bg-white/95 p-3 backdrop-blur">
      <div className="mx-auto flex max-w-lg gap-2">
        {!["PROBLEMA", "RETORNANDO"].includes(pedido.status) && <button type="button" onClick={informarProblema} disabled={enviando} className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-amber-200 text-amber-700"><AlertTriangle size={20} /></button>}
        {acao && <button type="button" onClick={() => atualizarEtapa(acao.status)} disabled={enviando} className="flex h-14 flex-1 items-center justify-center gap-2 rounded-2xl bg-[#7A1420] px-4 font-semibold text-white shadow-lg shadow-red-900/20 disabled:opacity-50">
          <acao.icon size={19} /> {enviando ? "Atualizando..." : acao.label} <ChevronRight size={17} />
        </button>}
        {pedido.status === "RETORNANDO" && <div className="flex h-14 flex-1 items-center justify-center rounded-2xl bg-amber-50 px-4 text-sm font-semibold text-amber-700"><Clock3 size={18} className="mr-2" /> Retorne à loja</div>}
      </div>
    </footer>}
  </main>;
}
