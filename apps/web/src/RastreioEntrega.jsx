import React, { useEffect, useMemo, useState } from "react";
import {
  Bike,
  CheckCircle2,
  Clock3,
  MapPin,
  Navigation,
  PackageCheck,
  RefreshCw,
  ShieldCheck,
  Store,
} from "lucide-react";
import { api } from "./api.ts";

const apresentacaoStatus = {
  AGUARDANDO: ["Pedido recebido", "A loja está organizando o despacho."],
  EM_PREPARO: ["Pedido em preparo", "Seu pedido está sendo preparado."],
  PRONTO: ["Pedido pronto", "Aguardando a retirada pelo entregador."],
  COLETA: ["Entregador acionado", "O entregador está a caminho da loja."],
  NA_LOJA: ["Entregador na loja", "Seu pedido está sendo retirado."],
  EM_ROTA: ["Saiu para entrega", "Seu pedido está a caminho."],
  NO_DESTINO: ["Entregador chegou", "O entregador está no endereço de entrega."],
  ENTREGUE: ["Pedido entregue", "Entrega concluída. Bom apetite!"],
  PROBLEMA: ["Atualização da entrega", "A loja está acompanhando uma ocorrência."],
  RETORNANDO: ["Retorno à loja", "A operação está acompanhando a entrega."],
  CANCELADO: ["Entrega cancelada", "Entre em contato com a loja para mais informações."],
};

const etapas = [
  { label: "Preparando", icon: PackageCheck, statuses: ["AGUARDANDO", "EM_PREPARO", "PRONTO"] },
  { label: "Coleta", icon: Store, statuses: ["COLETA", "NA_LOJA"] },
  { label: "Em rota", icon: Bike, statuses: ["EM_ROTA", "NO_DESTINO", "PROBLEMA", "RETORNANDO"] },
  { label: "Entregue", icon: CheckCircle2, statuses: ["ENTREGUE"] },
];

function indiceEtapa(status) {
  const indice = etapas.findIndex((etapa) => etapa.statuses.includes(status));
  return indice < 0 ? 0 : indice;
}

function hora(valor) {
  if (!valor) return "Sem atualização";
  return new Date(valor).toLocaleString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function RastreioEntrega({ token }) {
  const [pedido, setPedido] = useState(null);
  const [erro, setErro] = useState("");
  const [atualizando, setAtualizando] = useState(false);

  async function carregar(silencioso = false) {
    if (!silencioso) setAtualizando(true);
    try {
      setPedido(await api.getRastreioPublicoLogistica(token));
      setErro("");
    } catch (error) {
      if (!silencioso) setErro(error?.message || "Não foi possível acompanhar esta entrega.");
    } finally {
      if (!silencioso) setAtualizando(false);
    }
  }

  useEffect(() => {
    carregar();
    const timer = window.setInterval(() => carregar(true), 10_000);
    return () => window.clearInterval(timer);
  }, [token]);

  const apresentacao = apresentacaoStatus[pedido?.status] || ["Acompanhando pedido", "Aguarde uma nova atualização."];
  const etapaAtual = indiceEtapa(pedido?.status);
  const mapaUrl = useMemo(() => {
    const local = pedido?.ultimaLocalizacao;
    return local
      ? `https://www.google.com/maps?q=${local.latitude},${local.longitude}&z=16&output=embed`
      : "";
  }, [pedido?.ultimaLocalizacao?.latitude, pedido?.ultimaLocalizacao?.longitude]);

  if (erro) {
    return <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <section className="w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-xl">
        <Clock3 className="mx-auto text-[#7A1420]" size={36} />
        <h1 className="mt-4 text-xl font-bold text-slate-900">Rastreio indisponível</h1>
        <p className="mt-2 text-sm text-slate-500">{erro}</p>
        <p className="mt-5 text-xs text-slate-400">Peça um novo link à Imperial Parma.</p>
      </section>
    </main>;
  }

  return <main className="min-h-screen bg-[#f5f1ee] pb-10">
    <header className="bg-[#2B0005] px-4 py-5 text-white">
      <div className="mx-auto flex max-w-2xl items-center justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-red-200">Imperial Parma</p>
          <h1 className="mt-1 text-lg font-bold">Acompanhe seu pedido</h1>
        </div>
        <ShieldCheck className="text-red-200" size={26} />
      </div>
    </header>

    <div className="mx-auto max-w-2xl px-4 py-6">
      {!pedido ? <div className="rounded-3xl bg-white p-10 text-center shadow-sm"><RefreshCw className="mx-auto animate-spin text-[#7A1420]" size={28} /><p className="mt-3 text-sm text-slate-500">Buscando sua entrega...</p></div> : <>
        <section className="rounded-3xl bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-mono text-xs text-slate-400">{pedido.codigoPedido}</p>
              <h2 className="mt-2 text-2xl font-bold text-slate-900">{apresentacao[0]}</h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">{apresentacao[1]}</p>
            </div>
            <button type="button" onClick={() => carregar()} disabled={atualizando} aria-label="Atualizar rastreio" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-500">
              <RefreshCw size={17} className={atualizando ? "animate-spin" : ""} />
            </button>
          </div>

          <div className="mt-7 grid grid-cols-4">
            {etapas.map((etapa, index) => {
              const Icon = etapa.icon;
              const concluida = index <= etapaAtual && pedido.status !== "CANCELADO";
              return <div key={etapa.label} className="relative text-center">
                {index > 0 && <div className={`absolute right-1/2 top-4 h-1 w-full ${concluida ? "bg-[#7A1420]" : "bg-slate-100"}`} />}
                <div className={`relative z-10 mx-auto flex h-9 w-9 items-center justify-center rounded-full ${concluida ? "bg-[#7A1420] text-white" : "bg-slate-100 text-slate-400"}`}><Icon size={16} /></div>
                <p className={`mt-2 text-[10px] font-medium ${concluida ? "text-[#7A1420]" : "text-slate-400"}`}>{etapa.label}</p>
              </div>;
            })}
          </div>
        </section>

        <section className="mt-4 overflow-hidden rounded-3xl bg-white shadow-sm">
          {mapaUrl ? <iframe
            title="Localização aproximada do entregador"
            src={mapaUrl}
            className="h-72 w-full border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          /> : <div className="flex h-60 flex-col items-center justify-center bg-slate-50 px-8 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-[#7A1420] shadow-sm"><Navigation size={24} /></div>
            <h3 className="mt-4 font-semibold text-slate-800">Localização em breve</h3>
            <p className="mt-1 text-sm text-slate-500">O mapa aparecerá quando o entregador ativar o GPS.</p>
          </div>}
          <div className="flex items-center justify-between gap-4 p-5">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-red-50 text-[#7A1420]"><Bike size={19} /></div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-900">{pedido.entregador?.nome || "Entregador a confirmar"}</p>
                <p className="truncate text-xs text-slate-400">{pedido.entregador?.empresa || "Imperial Parma"}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[10px] uppercase text-slate-400">Último sinal</p>
              <p className="text-xs font-medium text-slate-600">{hora(pedido.ultimaLocalizacao?.registradoEm)}</p>
            </div>
          </div>
        </section>

        <section className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-white p-4 shadow-sm"><MapPin size={17} className="text-[#7A1420]" /><p className="mt-2 text-[10px] uppercase tracking-wide text-slate-400">Destino</p><p className="mt-1 text-sm font-semibold text-slate-800">{pedido.bairro}</p></div>
          <div className="rounded-2xl bg-white p-4 shadow-sm"><Clock3 size={17} className="text-sky-600" /><p className="mt-2 text-[10px] uppercase tracking-wide text-slate-400">Atualização</p><p className="mt-1 text-sm font-semibold text-slate-800">{hora(pedido.atualizadoEm)}</p></div>
        </section>

        <p className="mt-6 text-center text-[11px] leading-relaxed text-slate-400">A posição exibida depende do GPS e da conexão do aparelho do entregador. A página atualiza automaticamente.</p>
      </>}
    </div>
  </main>;
}
