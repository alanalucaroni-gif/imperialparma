"use client";

import React, { useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  Bike,
  CheckCircle2,
  Clock3,
  Code2,
  MapPin,
  Navigation,
  PackageCheck,
  Plus,
  RefreshCw,
  Route,
  Search,
  Settings2,
  Truck,
  UserCheck,
  Users,
  Wallet,
  XCircle,
} from "lucide-react";
import { contratoPedidoSischef } from "./logisticaSischef.js";

const inputClass = "mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2.5 text-sm outline-none focus:border-[#7A1420]";
const primaryButton = "rounded-xl bg-[#7A1420] hover:bg-[#611018] disabled:cursor-not-allowed disabled:opacity-40 px-4 py-2.5 text-sm font-medium text-white";
const secondaryButton = "rounded-xl border border-slate-200 dark:border-slate-600 px-4 py-2.5 text-sm hover:bg-slate-50 dark:hover:bg-slate-700/40";

const statusConfig = {
  AGUARDANDO: { label: "Aguardando despacho", tone: "amber" },
  COLETA: { label: "Aguardando coleta", tone: "blue" },
  EM_ROTA: { label: "Em rota", tone: "brand" },
  ENTREGUE: { label: "Entregue", tone: "green" },
  PROBLEMA: { label: "Com problema", tone: "red" },
  CANCELADO: { label: "Cancelado", tone: "slate" },
};

function cx(...classes) {
  return classes.filter(Boolean).join(" ");
}

function dinheiro(valor) {
  return Number(valor || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function numero(valor) {
  const texto = String(valor ?? "").trim();
  const normalizado = texto.includes(",") ? texto.replace(/\./g, "").replace(",", ".") : texto;
  const convertido = Number(normalizado);
  return Number.isFinite(convertido) ? convertido : 0;
}

function dataHora() {
  return new Date().toISOString();
}

function hora(valor) {
  if (!valor) return "—";
  return new Date(valor).toLocaleString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

function hoje(valor) {
  if (!valor) return false;
  const data = new Date(valor);
  const atual = new Date();
  return data.toDateString() === atual.toDateString();
}

function Card({ children, className = "" }) {
  return <div className={cx("rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800/60", className)}>{children}</div>;
}

function Badge({ children, tone = "slate" }) {
  const tons = {
    amber: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300",
    blue: "bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-300",
    brand: "bg-red-50 text-[#7A1420] dark:bg-red-500/10 dark:text-red-300",
    green: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300",
    red: "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300",
    slate: "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300",
  };
  return <span className={cx("inline-flex rounded-full px-2.5 py-1 text-[11px] font-medium", tons[tone] || tons.slate)}>{children}</span>;
}

function Kpi({ label, value, detail, icon: Icon, alert = false }) {
  return <Card className="p-4"><div className="flex items-start justify-between gap-3"><div><div className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{label}</div><div className={cx("mt-1 text-xl font-semibold", alert ? "text-rose-600" : "text-slate-900 dark:text-white")}>{value}</div><div className="mt-1 text-xs text-slate-400">{detail}</div></div><div className={cx("flex h-10 w-10 items-center justify-center rounded-xl", alert ? "bg-rose-50 text-rose-600 dark:bg-rose-500/10" : "bg-red-50 text-[#7A1420] dark:bg-red-500/10 dark:text-red-300")}><Icon size={18} /></div></div></Card>;
}

function carregar(chave, fallback) {
  try {
    const dados = JSON.parse(localStorage.getItem(chave) || "null");
    return dados ?? fallback;
  } catch {
    return fallback;
  }
}

function salvar(chave, valor) {
  localStorage.setItem(chave, JSON.stringify(valor));
  return valor;
}

const formularioInicial = {
  codigoPedido: "",
  clienteNome: "",
  clienteTelefone: "",
  endereco: "",
  bairro: "",
  canal: "Direto",
  formaPagamento: "",
  valorPedido: "",
  taxaEntregaCliente: "",
  distanciaKm: "",
  observacoes: "",
};

export default function CentralLogistica({ entregadores, onConcluirEntrega }) {
  const [aba, setAba] = useState("painel");
  const [pedidos, setPedidos] = useState(() => carregar("imperial.logisticsOrders.v1", []));
  const [configuracao, setConfiguracao] = useState(() => carregar("imperial.logisticsSettings.v1", {
    valorKm: 2.5,
    valorMinimo: 8,
    raioMaximoKm: 12,
  }));
  const [form, setForm] = useState(formularioInicial);
  const [atribuicoes, setAtribuicoes] = useState({});
  const [busca, setBusca] = useState("");
  const [feedback, setFeedback] = useState(null);

  const ativos = entregadores.filter(item => item.ativo);
  const ocupados = new Set(pedidos.filter(item => ["COLETA", "EM_ROTA", "PROBLEMA"].includes(item.status)).map(item => item.entregador?.id).filter(Boolean));
  const disponiveis = ativos.filter(item => !ocupados.has(item.id));

  const pedidosFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    if (!termo) return pedidos;
    return pedidos.filter(item => [item.codigoPedido, item.clienteNome, item.bairro, item.endereco, item.entregador?.nome]
      .some(valor => String(valor || "").toLowerCase().includes(termo)));
  }, [pedidos, busca]);

  const grupos = {
    AGUARDANDO: pedidosFiltrados.filter(item => item.status === "AGUARDANDO"),
    COLETA: pedidosFiltrados.filter(item => item.status === "COLETA"),
    EM_ROTA: pedidosFiltrados.filter(item => ["EM_ROTA", "PROBLEMA"].includes(item.status)),
    ENTREGUE: pedidosFiltrados.filter(item => ["ENTREGUE", "CANCELADO"].includes(item.status)).slice(0, 20),
  };

  const entreguesHoje = pedidos.filter(item => item.status === "ENTREGUE" && hoje(item.entregueEm));
  const gastoHoje = entreguesHoje.reduce((total, item) => total + Number(item.custoReal ?? item.custoEstimado ?? 0), 0);
  const emOperacao = pedidos.filter(item => ["COLETA", "EM_ROTA", "PROBLEMA"].includes(item.status));
  const atrasados = emOperacao.filter(item => Date.now() - new Date(item.atualizadoEm).getTime() > 45 * 60 * 1000);

  function atualizarPedidos(transformar) {
    setPedidos(atuais => salvar("imperial.logisticsOrders.v1", transformar(atuais)));
  }

  function custoPara(distancia) {
    return Math.max(numero(configuracao.valorMinimo), numero(distancia) * numero(configuracao.valorKm));
  }

  function salvarConfiguracao(evento) {
    evento.preventDefault();
    const proxima = {
      valorKm: numero(configuracao.valorKm),
      valorMinimo: numero(configuracao.valorMinimo),
      raioMaximoKm: numero(configuracao.raioMaximoKm),
    };
    setConfiguracao(salvar("imperial.logisticsSettings.v1", proxima));
    setFeedback({ tone: "green", text: "Parâmetros da logística própria foram salvos." });
  }

  function cadastrarPedido(evento) {
    evento.preventDefault();
    if (!form.clienteNome.trim() || !form.endereco.trim() || !form.bairro.trim()) {
      setFeedback({ tone: "red", text: "Informe cliente, endereço e bairro." });
      return;
    }
    const distancia = numero(form.distanciaKm);
    if (distancia <= 0) {
      setFeedback({ tone: "red", text: "Informe a distância estimada em quilômetros." });
      return;
    }
    const agora = dataHora();
    const novo = {
      id: `LOG-${Date.now()}`,
      idExterno: null,
      codigoPedido: form.codigoPedido.trim() || `MAN-${String(pedidos.length + 1).padStart(4, "0")}`,
      clienteNome: form.clienteNome.trim(),
      clienteTelefone: form.clienteTelefone.trim(),
      endereco: form.endereco.trim(),
      bairro: form.bairro.trim(),
      canal: form.canal.trim() || "Direto",
      formaPagamento: form.formaPagamento.trim(),
      valorPedido: numero(form.valorPedido),
      taxaEntregaCliente: numero(form.taxaEntregaCliente),
      distanciaKm: distancia,
      custoEstimado: custoPara(distancia),
      custoReal: null,
      observacoes: form.observacoes.trim(),
      origem: "MANUAL",
      status: "AGUARDANDO",
      entregador: null,
      criadoEm: agora,
      atualizadoEm: agora,
      historico: [{ status: "AGUARDANDO", em: agora, descricao: "Pedido criado manualmente." }],
    };
    atualizarPedidos(atuais => [novo, ...atuais]);
    setForm(formularioInicial);
    setAba("painel");
    setFeedback({ tone: "green", text: `${novo.codigoPedido} entrou na fila de despacho.` });
  }

  function alterarStatus(id, status, descricao, extras = {}) {
    atualizarPedidos(atuais => atuais.map(item => item.id === id ? {
      ...item,
      ...extras,
      status,
      atualizadoEm: dataHora(),
      historico: [...(item.historico || []), { status, em: dataHora(), descricao }],
    } : item));
  }

  function despachar(pedido) {
    const entregadorId = atribuicoes[pedido.id];
    const entregador = ativos.find(item => item.id === entregadorId);
    if (!entregador) {
      setFeedback({ tone: "red", text: "Selecione um entregador ativo para despachar." });
      return;
    }
    alterarStatus(pedido.id, "COLETA", `Pedido atribuído a ${entregador.nome}.`, { entregador: { id: entregador.id, nome: entregador.nome, empresa: entregador.tipo }, atribuidoEm: dataHora() });
    setFeedback({ tone: "green", text: `${pedido.codigoPedido} atribuído a ${entregador.nome}.` });
  }

  function confirmarColeta(pedido) {
    alterarStatus(pedido.id, "EM_ROTA", "Pedido coletado e saiu para entrega.", { coletadoEm: dataHora(), saiuEntregaEm: dataHora() });
    setFeedback({ tone: "green", text: `${pedido.codigoPedido} saiu para entrega.` });
  }

  function concluirEntrega(pedido) {
    const resultado = onConcluirEntrega({
      pedido,
      entregador: {
        id: pedido.entregador.id,
        nome: pedido.entregador.nome,
        tipo: pedido.entregador.empresa,
      },
      custo: Number(pedido.custoEstimado || 0),
    });
    if (resultado.tone === "red") {
      setFeedback(resultado);
      return;
    }
    alterarStatus(pedido.id, "ENTREGUE", "Entrega concluída.", { entregueEm: dataHora(), custoReal: Number(pedido.custoEstimado || 0) });
    setFeedback(resultado);
  }

  function registrarProblema(pedido) {
    const descricao = window.prompt("Descreva o problema da entrega:");
    if (!descricao?.trim()) return;
    alterarStatus(pedido.id, "PROBLEMA", descricao.trim(), { ocorrencia: descricao.trim() });
    setFeedback({ tone: "amber", text: `Ocorrência registrada no ${pedido.codigoPedido}.` });
  }

  function cancelarPedido(pedido) {
    if (!window.confirm(`Cancelar o pedido logístico ${pedido.codigoPedido}?`)) return;
    alterarStatus(pedido.id, "CANCELADO", "Pedido logístico cancelado.", { canceladoEm: dataHora() });
    setFeedback({ tone: "amber", text: `${pedido.codigoPedido} foi cancelado sem gerar custo de entrega.` });
  }

  function PedidoCard({ pedido }) {
    const status = statusConfig[pedido.status] || statusConfig.AGUARDANDO;
    const saldoEntrega = Number(pedido.taxaEntregaCliente || 0) - Number(pedido.custoEstimado || 0);
    return <div className={cx("rounded-xl border bg-white p-3 dark:bg-slate-800", pedido.status === "PROBLEMA" ? "border-rose-300 dark:border-rose-500/40" : "border-slate-200 dark:border-slate-700")}>
      <div className="flex items-start justify-between gap-2"><div><div className="font-mono text-[10px] text-slate-400">{pedido.codigoPedido}</div><div className="mt-0.5 text-sm font-semibold text-slate-900 dark:text-white">{pedido.clienteNome}</div></div><Badge tone={status.tone}>{status.label}</Badge></div>
      <div className="mt-3 space-y-1.5 text-xs text-slate-500">
        <div className="flex items-start gap-1.5"><MapPin size={13} className="mt-0.5 shrink-0" /><span>{pedido.endereco} · {pedido.bairro}</span></div>
        <div className="flex items-center gap-1.5"><Route size={13} /><span>{Number(pedido.distanciaKm).toLocaleString("pt-BR")} km · custo {dinheiro(pedido.custoEstimado)}</span></div>
        <div className="flex items-center gap-1.5"><Wallet size={13} /><span>Pedido {dinheiro(pedido.valorPedido)} · taxa cliente {dinheiro(pedido.taxaEntregaCliente)} · saldo <strong className={saldoEntrega >= 0 ? "text-emerald-600" : "text-rose-600"}>{dinheiro(saldoEntrega)}</strong></span></div>
        {pedido.entregador && <div className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300"><Bike size={13} />{pedido.entregador.nome} · {pedido.entregador.empresa}</div>}
        <div className="flex items-center gap-1.5 text-slate-400"><Clock3 size={13} />Atualizado às {hora(pedido.atualizadoEm)}</div>
        {pedido.ocorrencia && <div className="rounded-lg bg-rose-50 p-2 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300"><AlertTriangle size={12} className="mr-1 inline" />{pedido.ocorrencia}</div>}
      </div>

      {pedido.status === "AGUARDANDO" && <div className="mt-3 flex gap-2"><select value={atribuicoes[pedido.id] || ""} onChange={evento => setAtribuicoes(atual => ({ ...atual, [pedido.id]: evento.target.value }))} className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-2 py-2 text-xs dark:border-slate-600 dark:bg-slate-800"><option value="">Selecionar entregador</option>{ativos.map(item => <option key={item.id} value={item.id} disabled={ocupados.has(item.id)}>{item.nome}{ocupados.has(item.id) ? " · ocupado" : ""}</option>)}</select><button type="button" onClick={() => despachar(pedido)} className="rounded-lg bg-[#7A1420] px-3 py-2 text-xs font-medium text-white">Despachar</button></div>}
      {pedido.status === "COLETA" && <div className="mt-3 flex gap-2"><button type="button" onClick={() => confirmarColeta(pedido)} className={cx(primaryButton, "flex-1 py-2 text-xs")}><PackageCheck size={13} className="mr-1 inline" />Confirmar coleta</button><button type="button" onClick={() => cancelarPedido(pedido)} className="rounded-lg border border-rose-200 px-3 text-xs text-rose-600"><XCircle size={14} /></button></div>}
      {pedido.status === "EM_ROTA" && <div className="mt-3 grid grid-cols-2 gap-2"><button type="button" onClick={() => concluirEntrega(pedido)} className={cx(primaryButton, "py-2 text-xs")}><CheckCircle2 size={13} className="mr-1 inline" />Concluir</button><button type="button" onClick={() => registrarProblema(pedido)} className="rounded-lg border border-amber-200 px-3 py-2 text-xs text-amber-700"><AlertTriangle size={13} className="mr-1 inline" />Problema</button></div>}
      {pedido.status === "PROBLEMA" && <button type="button" onClick={() => alterarStatus(pedido.id, "EM_ROTA", "Entrega retomada após ocorrência.", { ocorrencia: null })} className={cx(primaryButton, "mt-3 w-full py-2 text-xs")}><RefreshCw size={13} className="mr-1 inline" />Retomar entrega</button>}
    </div>;
  }

  const colunas = [
    { chave: "AGUARDANDO", titulo: "Aguardando despacho", icon: Clock3 },
    { chave: "COLETA", titulo: "Coleta", icon: PackageCheck },
    { chave: "EM_ROTA", titulo: "Em rota", icon: Navigation },
    { chave: "ENTREGUE", titulo: "Finalizados", icon: CheckCircle2 },
  ];

  return <div className="flex flex-col gap-4">
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div><h3 className="text-base font-semibold text-slate-900 dark:text-white">Central de Logística Imperial</h3><p className="text-sm text-slate-500 dark:text-slate-400">Operação própria preparada para receber pedidos do Sischef</p></div>
      <div className="flex gap-2"><Badge tone="amber">Sischef aguardando API</Badge><button type="button" onClick={() => setAba("novo")} className={primaryButton}><Plus size={15} className="mr-1 inline" />Novo pedido</button></div>
    </div>

    <div className="flex gap-1 overflow-x-auto border-b border-slate-200 dark:border-slate-700">
      {[["painel", "Painel de despacho"], ["novo", "Entrada manual"], ["integracao", "Preparação Sischef"]].map(([chave, label]) => <button key={chave} onClick={() => setAba(chave)} className={cx("whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-medium", aba === chave ? "border-[#7A1420] text-[#7A1420] dark:text-red-300" : "border-transparent text-slate-400")}>{label}</button>)}
    </div>

    {feedback && <div className={cx("rounded-xl border px-4 py-3 text-sm", feedback.tone === "green" ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300" : feedback.tone === "red" ? "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-300" : "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300")}>{feedback.text}</div>}

    {aba === "painel" && <>
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-5">
        <Kpi label="Aguardando" value={String(grupos.AGUARDANDO.length)} detail="Para despachar" icon={Clock3} />
        <Kpi label="Em operação" value={String(emOperacao.length)} detail="Coleta ou rota" icon={Truck} />
        <Kpi label="Entregadores livres" value={String(disponiveis.length)} detail={`${ativos.length} ativos`} icon={Users} />
        <Kpi label="Gasto hoje" value={dinheiro(gastoHoje)} detail={`${entreguesHoje.length} entregas`} icon={Wallet} />
        <Kpi label="Atenção" value={String(atrasados.length)} detail="Mais de 45 minutos" icon={AlertTriangle} alert={Boolean(atrasados.length)} />
      </div>
      <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-800/60"><Search size={15} className="text-slate-400" /><input value={busca} onChange={evento => setBusca(evento.target.value)} placeholder="Buscar pedido, cliente, bairro ou entregador..." className="w-full bg-transparent text-sm outline-none" /></div>
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-4">
        {colunas.map(({ chave, titulo, icon: Icon }) => <div key={chave} className="rounded-2xl bg-slate-50 p-3 dark:bg-slate-900/40"><div className="mb-3 flex items-center justify-between"><div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500"><Icon size={14} />{titulo}</div><span className="rounded-full bg-white px-2 py-0.5 text-xs text-slate-500 shadow-sm dark:bg-slate-800">{grupos[chave].length}</span></div><div className="flex flex-col gap-3">{grupos[chave].map(pedido => <PedidoCard key={pedido.id} pedido={pedido} />)}{!grupos[chave].length && <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center text-xs text-slate-400 dark:border-slate-700">Nenhum pedido</div>}</div></div>)}
      </div>
    </>}

    {aba === "novo" && <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_340px]">
      <Card className="p-5"><div className="mb-5"><h3 className="font-semibold text-slate-900 dark:text-white">Entrada manual de pedido</h3><p className="text-xs text-slate-400">Usada para testar a operação até a API do Sischef ser liberada</p></div><form onSubmit={cadastrarPedido} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="text-xs text-slate-500">Número do pedido<input value={form.codigoPedido} onChange={evento => setForm(atual => ({ ...atual, codigoPedido: evento.target.value }))} placeholder="Ex.: #2815" className={inputClass} /></label>
        <label className="text-xs text-slate-500">Cliente *<input value={form.clienteNome} onChange={evento => setForm(atual => ({ ...atual, clienteNome: evento.target.value }))} className={inputClass} /></label>
        <label className="text-xs text-slate-500">Telefone<input value={form.clienteTelefone} onChange={evento => setForm(atual => ({ ...atual, clienteTelefone: evento.target.value }))} className={inputClass} /></label>
        <label className="text-xs text-slate-500">Bairro *<input value={form.bairro} onChange={evento => setForm(atual => ({ ...atual, bairro: evento.target.value }))} className={inputClass} /></label>
        <label className="text-xs text-slate-500 sm:col-span-2">Endereço completo *<input value={form.endereco} onChange={evento => setForm(atual => ({ ...atual, endereco: evento.target.value }))} placeholder="Rua, número, complemento e referência" className={inputClass} /></label>
        <label className="text-xs text-slate-500">Canal<select value={form.canal} onChange={evento => setForm(atual => ({ ...atual, canal: evento.target.value }))} className={inputClass}><option>Direto</option><option>iFood</option><option>Cardápio Web</option><option>WhatsApp</option><option>Sischef</option></select></label>
        <label className="text-xs text-slate-500">Forma de pagamento<input value={form.formaPagamento} onChange={evento => setForm(atual => ({ ...atual, formaPagamento: evento.target.value }))} className={inputClass} /></label>
        <label className="text-xs text-slate-500">Valor do pedido<input inputMode="decimal" value={form.valorPedido} onChange={evento => setForm(atual => ({ ...atual, valorPedido: evento.target.value }))} placeholder="0,00" className={inputClass} /></label>
        <label className="text-xs text-slate-500">Taxa cobrada do cliente<input inputMode="decimal" value={form.taxaEntregaCliente} onChange={evento => setForm(atual => ({ ...atual, taxaEntregaCliente: evento.target.value }))} placeholder="0,00" className={inputClass} /></label>
        <label className="text-xs text-slate-500">Distância estimada (km) *<input inputMode="decimal" value={form.distanciaKm} onChange={evento => setForm(atual => ({ ...atual, distanciaKm: evento.target.value }))} placeholder="0,0" className={inputClass} /></label>
        <div className="rounded-xl bg-slate-50 px-4 py-3 dark:bg-slate-700/30"><div className="text-[10px] uppercase text-slate-400">Custo próprio estimado</div><div className="mt-1 text-lg font-semibold text-[#7A1420] dark:text-red-300">{form.distanciaKm ? dinheiro(custoPara(form.distanciaKm)) : "—"}</div><div className="text-[11px] text-slate-400">{dinheiro(configuracao.valorKm)}/km · mínimo {dinheiro(configuracao.valorMinimo)}</div></div>
        <label className="text-xs text-slate-500 sm:col-span-2">Observações<input value={form.observacoes} onChange={evento => setForm(atual => ({ ...atual, observacoes: evento.target.value }))} className={inputClass} /></label>
        <div className="flex justify-end gap-2 sm:col-span-2"><button type="button" onClick={() => setForm(formularioInicial)} className={secondaryButton}>Limpar</button><button className={primaryButton}><Plus size={15} className="mr-1 inline" />Colocar na fila</button></div>
      </form></Card>
      <Card className="p-5"><Route size={22} className="text-[#7A1420] dark:text-red-300" /><h3 className="mt-3 font-semibold text-slate-900 dark:text-white">Como funciona agora</h3><ol className="mt-4 space-y-3 text-sm text-slate-500"><li className="flex gap-2"><span className="font-semibold text-[#7A1420]">1.</span>Cadastre o pedido recebido.</li><li className="flex gap-2"><span className="font-semibold text-[#7A1420]">2.</span>Selecione o entregador no painel.</li><li className="flex gap-2"><span className="font-semibold text-[#7A1420]">3.</span>Confirme coleta e saída.</li><li className="flex gap-2"><span className="font-semibold text-[#7A1420]">4.</span>Conclua para registrar o custo.</li></ol></Card>
    </div>}

    {aba === "integracao" && <div className="grid grid-cols-1 gap-4 xl:grid-cols-[360px_1fr]">
      <div className="flex flex-col gap-4">
        <Card className="p-5"><div className="flex items-center gap-2"><Settings2 size={18} className="text-[#7A1420] dark:text-red-300" /><h3 className="font-semibold text-slate-900 dark:text-white">Parâmetros da frota própria</h3></div><p className="mb-4 mt-1 text-xs text-slate-400">Valores iniciais de teste; ajuste antes de operar</p><form onSubmit={salvarConfiguracao} className="space-y-3"><label className="text-xs text-slate-500">Valor por quilômetro<input inputMode="decimal" value={configuracao.valorKm} onChange={evento => setConfiguracao(atual => ({ ...atual, valorKm: evento.target.value }))} className={inputClass} /></label><label className="text-xs text-slate-500">Valor mínimo por entrega<input inputMode="decimal" value={configuracao.valorMinimo} onChange={evento => setConfiguracao(atual => ({ ...atual, valorMinimo: evento.target.value }))} className={inputClass} /></label><label className="text-xs text-slate-500">Raio máximo (km)<input inputMode="decimal" value={configuracao.raioMaximoKm} onChange={evento => setConfiguracao(atual => ({ ...atual, raioMaximoKm: evento.target.value }))} className={inputClass} /></label><button className={cx(primaryButton, "w-full")}>Salvar parâmetros</button></form></Card>
        <Card className="p-5"><Navigation size={20} className="text-sky-600" /><h3 className="mt-2 font-semibold text-slate-900 dark:text-white">Rastreamento GPS</h3><p className="mt-2 text-sm text-slate-500">Estrutura reservada para o aplicativo do entregador enviar localização, disponibilidade e status em tempo real.</p><Badge tone="blue">Próxima etapa</Badge></Card>
      </div>
      <Card className="overflow-hidden"><div className="border-b border-slate-100 p-5 dark:border-slate-700"><div className="flex items-center gap-2"><Code2 size={18} className="text-[#7A1420] dark:text-red-300" /><h3 className="font-semibold text-slate-900 dark:text-white">Contrato de entrada do Sischef</h3></div><p className="mt-1 text-xs text-slate-400">Esses campos alimentarão automaticamente a mesma fila usada pela entrada manual</p></div><div className="overflow-x-auto"><table className="w-full min-w-[620px] text-sm"><thead><tr className="border-b border-slate-100 text-left text-xs uppercase text-slate-400 dark:border-slate-700"><th className="px-4 py-3 font-medium">Campo Imperial</th><th className="px-4 py-3 font-medium">Informação esperada</th><th className="px-4 py-3 font-medium">Obrigatório</th></tr></thead><tbody>{contratoPedidoSischef.map(item => <tr key={item.imperial} className="border-b border-slate-50 dark:border-slate-700/50"><td className="px-4 py-3 font-mono text-xs text-[#7A1420] dark:text-red-300">{item.imperial}</td><td className="px-4 py-3 text-slate-600 dark:text-slate-300">{item.descricao}</td><td className="px-4 py-3"><Badge tone={item.obrigatorio ? "amber" : "slate"}>{item.obrigatorio ? "Sim" : "Opcional"}</Badge></td></tr>)}</tbody></table></div><div className="border-t border-slate-100 bg-slate-50 p-4 text-xs text-slate-500 dark:border-slate-700 dark:bg-slate-900/30"><ArrowRight size={13} className="mr-1 inline" />Quando a API for liberada, criaremos um webhook autenticado e idempotente; nenhuma tela operacional precisará ser refeita.</div></Card>
    </div>}
  </div>;
}
