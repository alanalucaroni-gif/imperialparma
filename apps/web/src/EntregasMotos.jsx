"use client";

import React, { useEffect, useMemo, useState } from "react";
import CentralLogistica from "./CentralLogistica.jsx";
import { abrirRelatorioMotosPdf } from "./relatorioMotosPdf.js";
import { api } from "./api.ts";
import { empresaUsaPrecoTabela, valorTabelaEntrega } from "./regraCustoEntrega.js";
import {
  BarChart3,
  Bike,
  Building2,
  Download,
  CircleDollarSign,
  FileBarChart2,
  Filter,
  MapPin,
  Pencil,
  Plus,
  Power,
  Search,
  Trash2,
  Users,
  X,
} from "lucide-react";

const inputClass = "mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2.5 text-sm outline-none focus:border-[#7A1420]";
const primaryButton = "rounded-xl bg-[#7A1420] hover:bg-[#611018] disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium px-4 py-2.5";
const secondaryButton = "rounded-xl border border-slate-200 dark:border-slate-600 text-sm px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-700/40";

function cx(...classes) {
  return classes.filter(Boolean).join(" ");
}

function normalizar(texto) {
  return String(texto || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

function numero(valor) {
  const texto = String(valor ?? "").trim();
  const normalizado = texto.includes(",") ? texto.replace(/\./g, "").replace(",", ".") : texto;
  const convertido = Number(normalizado);
  return Number.isFinite(convertido) ? convertido : 0;
}

function dinheiro(valor) {
  return Number(valor || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function tarifaDaCorrida(tarifas, empresa, bairro) {
  return valorTabelaEntrega(tarifas, empresa, bairro);
}

function dataDaCorrida(corrida) {
  if (corrida.dataLancamento) {
    const data = new Date(corrida.dataLancamento);
    if (!Number.isNaN(data.getTime())) return data;
  }
  const texto = normalizar(corrida.lancadaEm);
  const data = new Date();
  if (texto.startsWith("ontem")) data.setDate(data.getDate() - 1);
  if (texto.startsWith("hoje") || texto.startsWith("ontem")) {
    data.setHours(12, 0, 0, 0);
    return data;
  }
  return null;
}

function dataIsoLocal(data) {
  if (!data) return "";
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, "0");
  const dia = String(data.getDate()).padStart(2, "0");
  return `${ano}-${mes}-${dia}`;
}

function Card({ children, className = "" }) {
  return (
    <div className={cx("rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 shadow-sm", className)}>
      {children}
    </div>
  );
}

function Badge({ children, tone = "slate" }) {
  const tones = {
    green: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300",
    red: "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300",
    amber: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300",
    brand: "bg-red-50 text-[#7A1420] dark:bg-red-500/10 dark:text-red-300",
    slate: "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300",
  };
  return <span className={cx("inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium", tones[tone] || tones.slate)}>{children}</span>;
}

function Kpi({ label, value, detail, icon: Icon }) {
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs uppercase tracking-wide text-slate-400">{label}</div>
          <div className="mt-1 text-xl font-semibold text-slate-900 dark:text-white">{value}</div>
          <div className="mt-1 text-xs text-slate-400">{detail}</div>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-[#7A1420] dark:bg-red-500/10 dark:text-red-300">
          <Icon size={18} />
        </div>
      </div>
    </Card>
  );
}

function Feedback({ feedback }) {
  if (!feedback) return null;
  return (
    <div className={cx(
      "rounded-xl border px-4 py-3 text-sm",
      feedback.tone === "green"
        ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300"
        : feedback.tone === "red"
          ? "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-300"
          : "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300",
    )}>
      {feedback.text}
    </div>
  );
}

export default function EntregasMotos({
  entregadores,
  empresas,
  tarifas,
  corridas,
  caixaAberto,
  onCadastrar,
  onAtualizar,
  onExcluir,
  onCadastrarEmpresa,
  onLancarLote,
  onConcluirEntrega,
  onSalvarTarifa,
}) {
  const entregadoresAtivos = useMemo(() => entregadores.filter(item => item.ativo), [entregadores]);
  const empresasOrdenadas = useMemo(
    () => [...new Set(empresas.filter(Boolean))].sort((a, b) => a.localeCompare(b, "pt-BR")),
    [empresas],
  );

  const [tab, setTab] = useState("central");
  const [feedback, setFeedback] = useState(null);
  const [modoEntregador, setModoEntregador] = useState("cadastrado");
  const [entregadorId, setEntregadorId] = useState(entregadoresAtivos[0]?.id ?? "");
  const [nomeAvulso, setNomeAvulso] = useState("");
  const [empresaAvulsa, setEmpresaAvulsa] = useState(empresasOrdenadas[0] ?? "Particular");
  const [bairro, setBairro] = useState(tarifas[0]?.bairro ?? "");
  const [pedido, setPedido] = useState("");
  const [usarValorLivre, setUsarValorLivre] = useState(false);
  const [valorLivre, setValorLivre] = useState("");
  const [lista, setLista] = useState([]);
  const [responsavelLista, setResponsavelLista] = useState(null);

  const [entregadorEditandoId, setEntregadorEditandoId] = useState(null);
  const [formEntregador, setFormEntregador] = useState({
    nome: "",
    telefone: "",
    tipo: empresasOrdenadas[0] ?? "Particular",
  });
  const [novaEmpresa, setNovaEmpresa] = useState("");

  const [buscaTarifa, setBuscaTarifa] = useState("");
  const [bairroOriginal, setBairroOriginal] = useState(null);
  const [bairroCadastro, setBairroCadastro] = useState("");
  const [valoresCadastro, setValoresCadastro] = useState({});

  const [filtroInicio, setFiltroInicio] = useState("");
  const [filtroFim, setFiltroFim] = useState("");
  const [filtroBairro, setFiltroBairro] = useState("");
  const [filtroEmpresa, setFiltroEmpresa] = useState("");
  const [filtroEntregador, setFiltroEntregador] = useState("");
  const [dataFechamento, setDataFechamento] = useState(() => dataIsoLocal(new Date()));
  const [ordensPagamento, setOrdensPagamento] = useState([]);
  const [processandoOrdens, setProcessandoOrdens] = useState(false);

  useEffect(() => {
    if (!entregadoresAtivos.some(item => item.id === entregadorId) && !lista.length) {
      setEntregadorId(entregadoresAtivos[0]?.id ?? "");
    }
  }, [entregadoresAtivos, entregadorId, lista.length]);

  useEffect(() => {
    if (!empresasOrdenadas.includes(empresaAvulsa)) setEmpresaAvulsa(empresasOrdenadas[0] ?? "Particular");
    setFormEntregador(atual => ({
      ...atual,
      tipo: empresasOrdenadas.includes(atual.tipo) ? atual.tipo : (empresasOrdenadas[0] ?? "Particular"),
    }));
  }, [empresasOrdenadas, empresaAvulsa]);

  useEffect(() => {
    if (tab === "relatorios" && api.enabled) carregarOrdensPagamento();
  }, [tab]);

  const entregadorCadastrado = entregadores.find(item => item.id === entregadorId);
  const empresaCorrida = modoEntregador === "avulso" ? empresaAvulsa : entregadorCadastrado?.tipo;
  const empresaTabelaObrigatoria = empresaUsaPrecoTabela(empresaCorrida);
  const valorTabela = tarifaDaCorrida(tarifas, empresaCorrida, bairro);
  const usaValorLivreEfetivo = !empresaTabelaObrigatoria && (modoEntregador === "avulso" || usarValorLivre);
  const valorAplicado = usaValorLivreEfetivo ? numero(valorLivre) : Number(valorTabela || 0);
  const totalLista = lista.reduce((total, item) => total + Number(item.valor || 0), 0);
  const totalGeral = corridas.reduce((total, item) => total + Number(item.valor || 0), 0);

  const resumoEntregadores = useMemo(() => {
    const grupos = new Map();
    corridas.forEach(corrida => {
      const chave = `${corrida.entregadorId}|${corrida.empresa}`;
      const atual = grupos.get(chave) ?? {
        entregador: corrida.entregador,
        empresa: corrida.empresa,
        corridas: 0,
        total: 0,
      };
      atual.corridas += 1;
      atual.total += Number(corrida.valor || 0);
      grupos.set(chave, atual);
    });
    return [...grupos.values()].sort((a, b) => b.total - a.total);
  }, [corridas]);

  const tarifasFiltradas = useMemo(() => {
    const busca = normalizar(buscaTarifa);
    return busca ? tarifas.filter(item => normalizar(item.bairro).includes(busca)) : tarifas;
  }, [tarifas, buscaTarifa]);

  const opcoesRelatorio = useMemo(() => ({
    bairros: [...new Set(corridas.map(item => item.bairro).filter(Boolean))].sort((a, b) => a.localeCompare(b, "pt-BR")),
    empresas: [...new Set(corridas.map(item => item.empresa).filter(Boolean))].sort((a, b) => a.localeCompare(b, "pt-BR")),
    entregadores: [...new Set(corridas.map(item => item.entregador).filter(Boolean))].sort((a, b) => a.localeCompare(b, "pt-BR")),
  }), [corridas]);

  const corridasFiltradas = useMemo(() => corridas.filter(corrida => {
    if (filtroBairro && corrida.bairro !== filtroBairro) return false;
    if (filtroEmpresa && corrida.empresa !== filtroEmpresa) return false;
    if (filtroEntregador && corrida.entregador !== filtroEntregador) return false;
    const data = dataDaCorrida(corrida);
    if (filtroInicio && (!data || dataIsoLocal(data) < filtroInicio)) return false;
    if (filtroFim && (!data || dataIsoLocal(data) > filtroFim)) return false;
    return true;
  }), [corridas, filtroBairro, filtroEmpresa, filtroEntregador, filtroInicio, filtroFim]);

  const consolidadoRelatorio = useMemo(() => {
    const grupos = new Map();
    corridasFiltradas.forEach(corrida => {
      const chave = [corrida.bairro, corrida.empresa, corrida.entregador].join("|");
      const atual = grupos.get(chave) ?? {
        bairro: corrida.bairro,
        empresa: corrida.empresa,
        entregador: corrida.entregador,
        corridas: 0,
        recebidoCliente: 0,
        pagoMoto: 0,
      };
      atual.corridas += 1;
      atual.recebidoCliente += Number(corrida.taxaCliente || 0);
      atual.pagoMoto += Number(corrida.valor || 0);
      atual.saldo = atual.recebidoCliente - atual.pagoMoto;
      grupos.set(chave, atual);
    });
    return [...grupos.values()].sort((a, b) => b.pagoMoto - a.pagoMoto);
  }, [corridasFiltradas]);

  const totalRelatorio = corridasFiltradas.reduce((total, item) => total + Number(item.valor || 0), 0);
  const totalRecebidoCliente = corridasFiltradas.reduce((total, item) => total + Number(item.taxaCliente || 0), 0);
  const saldoTaxasEntrega = totalRecebidoCliente - totalRelatorio;
  const comparativoEmpresas = useMemo(() => {
    const grupos = new Map();
    corridasFiltradas.forEach(corrida => {
      const nome = corrida.empresa || "Não informado";
      const atual = grupos.get(nome) ?? { nome, corridas: 0, total: 0 };
      atual.corridas += 1;
      atual.total += Number(corrida.valor || 0);
      grupos.set(nome, atual);
    });
    return [...grupos.values()].sort((a, b) => b.total - a.total);
  }, [corridasFiltradas]);

  const comparativoEntregadores = useMemo(() => {
    const grupos = new Map();
    corridasFiltradas.forEach(corrida => {
      const nome = corrida.entregador || "Não informado";
      const atual = grupos.get(nome) ?? { nome, corridas: 0, total: 0 };
      atual.corridas += 1;
      atual.total += Number(corrida.valor || 0);
      grupos.set(nome, atual);
    });
    return [...grupos.values()].sort((a, b) => b.total - a.total);
  }, [corridasFiltradas]);

  const maiorEmpresa = comparativoEmpresas[0]?.total || 1;
  const maiorEntregador = comparativoEntregadores[0]?.total || 1;


  function bloquearTroca() {
    if (!lista.length) return false;
    setFeedback({ tone: "amber", text: "Finalize ou limpe a lista atual antes de trocar o entregador." });
    return true;
  }

  function trocarModo(novoModo) {
    if (bloquearTroca()) return;
    setModoEntregador(novoModo);
    if (novoModo === "avulso") setUsarValorLivre(true);
  }

  function trocarEntregador(id) {
    if (bloquearTroca()) return;
    setEntregadorId(id);
  }

  function limparLista() {
    setLista([]);
    setResponsavelLista(null);
  }

  function montarResponsavel() {
    if (modoEntregador === "cadastrado") return entregadorCadastrado;
    const nome = nomeAvulso.trim();
    if (!nome) return null;
    return {
      id: `AVULSO-${Date.now()}`,
      nome,
      telefone: "",
      tipo: empresaAvulsa || "Particular",
      ativo: true,
      avulso: true,
    };
  }

  function adicionarCorrida(evento) {
    evento.preventDefault();
    const responsavel = responsavelLista || montarResponsavel();
    if (!responsavel) {
      setFeedback({ tone: "red", text: modoEntregador === "avulso" ? "Digite o nome do entregador avulso." : "Selecione um entregador ativo." });
      return;
    }
    if (!bairro.trim()) {
      setFeedback({ tone: "red", text: "Informe o bairro ou destino da entrega." });
      return;
    }
    if (empresaTabelaObrigatoria && valorTabela == null) {
      setFeedback({ tone: "red", text: `Cadastre o preço de ${empresaCorrida} para ${bairro.trim()} na Tabela de Bairros.` });
      return;
    }
    if (valorAplicado <= 0) {
      setFeedback({ tone: "red", text: "Informe um valor livre maior que zero ou selecione um destino com preço cadastrado." });
      return;
    }
    setResponsavelLista(responsavel);
    setLista(atual => [...atual, {
      id: `ITEM-${Date.now()}-${atual.length + 1}`,
      pedido: pedido.trim() || "Sem número",
      bairro: bairro.trim(),
      valor: valorAplicado,
      origemValor: usaValorLivreEfetivo ? "livre" : "tabela",
    }]);
    setPedido("");
    setFeedback({ tone: "green", text: `${bairro.trim()} adicionado à lista de ${responsavel.nome}.` });
  }

  function removerCorrida(id) {
    setLista(atual => {
      const novaLista = atual.filter(item => item.id !== id);
      if (!novaLista.length) setResponsavelLista(null);
      return novaLista;
    });
  }

  function finalizarLista() {
    if (!lista.length || !responsavelLista) {
      setFeedback({ tone: "red", text: "Adicione pelo menos uma corrida antes de confirmar." });
      return;
    }
    const resultado = onLancarLote({ entregador: responsavelLista, itens: lista });
    setFeedback(resultado);
    if (resultado.tone === "green") {
      limparLista();
      if (modoEntregador === "avulso") {
        setNomeAvulso("");
        setValorLivre("");
      }
    }
  }

  function limparFormularioEntregador() {
    setEntregadorEditandoId(null);
    setFormEntregador({ nome: "", telefone: "", tipo: empresasOrdenadas[0] ?? "Particular" });
  }

  function salvarEntregador(evento) {
    evento.preventDefault();
    if (!formEntregador.nome.trim()) {
      setFeedback({ tone: "red", text: "Informe o nome do entregador." });
      return;
    }
    const atual = entregadores.find(item => item.id === entregadorEditandoId);
    const dados = {
      id: entregadorEditandoId,
      nome: formEntregador.nome.trim(),
      telefone: formEntregador.telefone.trim(),
      tipo: formEntregador.tipo,
      ativo: atual?.ativo ?? true,
    };
    const resultado = entregadorEditandoId ? onAtualizar(dados) : onCadastrar(dados);
    setFeedback(resultado);
    if (resultado.tone === "green") limparFormularioEntregador();
  }

  function editarEntregador(entregador) {
    setEntregadorEditandoId(entregador.id);
    setFormEntregador({ nome: entregador.nome, telefone: entregador.telefone || "", tipo: entregador.tipo });
    setFeedback({ tone: "amber", text: `Editando ${entregador.nome}.` });
  }

  function alternarStatus(entregador) {
    const resultado = onAtualizar({ ...entregador, ativo: !entregador.ativo });
    setFeedback(resultado);
  }

  function excluirEntregador(entregador) {
    const resultado = onExcluir(entregador.id);
    setFeedback(resultado);
    if (resultado.tone === "green" && entregadorEditandoId === entregador.id) limparFormularioEntregador();
  }

  function cadastrarEmpresa(evento) {
    evento.preventDefault();
    const nome = novaEmpresa.trim();
    if (!nome) {
      setFeedback({ tone: "red", text: "Informe o nome da nova empresa." });
      return;
    }
    const resultado = onCadastrarEmpresa(nome);
    setFeedback(resultado);
    if (resultado.tone === "green") {
      setFormEntregador(atual => ({ ...atual, tipo: nome }));
      setEmpresaAvulsa(nome);
      setNovaEmpresa("");
    }
  }

  function editarTarifa(tarifa) {
    setBairroOriginal(tarifa.bairro);
    setBairroCadastro(tarifa.bairro);
    setValoresCadastro({ ...tarifa.valores });
    setFeedback({ tone: "amber", text: `Editando ${tarifa.bairro}.` });
    setTimeout(() => document.getElementById("bairro-tarifa-motos")?.focus(), 0);
  }

  function limparTarifa() {
    setBairroOriginal(null);
    setBairroCadastro("");
    setValoresCadastro({});
  }

  function salvarTarifa(evento) {
    evento.preventDefault();
    const valores = Object.fromEntries(
      empresasOrdenadas
        .map(empresa => [empresa, numero(valoresCadastro[empresa])])
        .filter(([, valor]) => valor > 0),
    );
    const resultado = onSalvarTarifa({ bairroOriginal, bairro: bairroCadastro.trim(), valores });
    setFeedback(resultado);
    if (resultado.tone === "green") limparTarifa();
  }

  function limparFiltros() {
    setFiltroInicio("");
    setFiltroFim("");
    setFiltroBairro("");
    setFiltroEmpresa("");
    setFiltroEntregador("");
  }

  function gerarPdfRelatorio() {
    const resultado = abrirRelatorioMotosPdf({
      corridas: corridasFiltradas,
      filtros: {
        inicio: filtroInicio,
        fim: filtroFim,
        bairro: filtroBairro,
        empresa: filtroEmpresa,
        entregador: filtroEntregador,
      },
    });
    setFeedback(resultado);
  }

  async function carregarOrdensPagamento() {
    if (!api.enabled) return;
    try {
      const resposta = await api.getOrdensPagamentoLogistica({
        dataInicio: filtroInicio || undefined,
        dataFim: filtroFim || undefined,
      });
      setOrdensPagamento(resposta.data || []);
    } catch (error) {
      setFeedback({ tone: "red", text: error?.message || "Não foi possível carregar as ordens de pagamento." });
    }
  }

  async function gerarOrdensPagamento() {
    setProcessandoOrdens(true);
    try {
      const resposta = await api.gerarOrdensPagamentoLogistica(dataFechamento);
      setOrdensPagamento(resposta.data || []);
      setFeedback({ tone: "green", text: `${resposta.resumo?.entregadores || 0} ordem(ns) gerada(s) para ${resposta.resumo?.corridas || 0} corrida(s), sem duplicar pagamentos.` });
    } catch (error) {
      setFeedback({ tone: "red", text: error?.message || "Não foi possível gerar o fechamento do dia." });
    } finally {
      setProcessandoOrdens(false);
    }
  }

  async function marcarOrdemPaga(id) {
    try {
      const atualizada = await api.pagarOrdemPagamentoLogistica(id);
      setOrdensPagamento(atuais => atuais.map(item => item.id === id ? atualizada : item));
      setFeedback({ tone: "green", text: `Ordem ${atualizada.codigo} marcada como paga.` });
    } catch (error) {
      setFeedback({ tone: "red", text: error?.message || "Não foi possível confirmar o pagamento." });
    }
  }

  return (

    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Motos e entregas</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Corridas por empresa, entregador cadastrado ou profissional avulso</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge tone={caixaAberto ? "green" : "amber"}>{caixaAberto ? `${caixaAberto.id} disponível` : "Caixa fechado"}</Badge>
          <button onClick={() => setTab("corridas")} className={primaryButton}><Plus size={15} className="mr-1 inline" />Nova lista</button>
        </div>
      </div>

      <div className="rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-800 dark:border-sky-500/20 dark:bg-sky-500/10 dark:text-sky-200">
        <Bike size={16} className="mr-2 inline" />
        Use entregadores cadastrados para o dia a dia. Em uma chamada ocasional, escolha <strong>Digitar nome na hora</strong> e informe um valor livre.
      </div>

      <div className="flex gap-1 overflow-x-auto border-b border-slate-200 dark:border-slate-700">
        {[
          ["central", "Central de logística"],
          ["corridas", "Corridas e acertos"],
          ["entregadores", "Entregadores e empresas"],
          ["tarifas", "Tabela de bairros"],
          ["relatorios", "Relatórios"],
        ].map(([chave, rotulo]) => (
          <button key={chave} onClick={() => setTab(chave)} className={cx(
            "whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-medium",
            tab === chave ? "border-[#7A1420] text-[#7A1420] dark:text-red-300" : "border-transparent text-slate-400",
          )}>
            {rotulo}
          </button>
        ))}
      </div>

      <Feedback feedback={feedback} />

      {tab === "central" && <CentralLogistica entregadores={entregadores} tarifas={tarifas} onConcluirEntrega={onConcluirEntrega} />}

      {tab === "corridas" && (
        <>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <Kpi label="Corridas" value={String(corridas.length)} detail="Lançamentos registrados" icon={Bike} />
            <Kpi label="Custo de motos" value={dinheiro(totalGeral)} detail="Total de saídas" icon={CircleDollarSign} />
            <Kpi label="Entregadores" value={String(resumoEntregadores.length)} detail="Cadastrados e avulsos" icon={Users} />
            <Kpi label="Custo médio" value={dinheiro(corridas.length ? totalGeral / corridas.length : 0)} detail="Por corrida" icon={BarChart3} />
          </div>

          <Card className="p-5">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-50 dark:bg-red-500/10">
                <Bike size={17} className="text-[#7A1420] dark:text-red-300" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Montar lista do entregador</h3>
                <p className="text-xs text-slate-400">A lista gera uma única saída no caixa, mantendo cada corrida no relatório</p>
              </div>
            </div>

            <div className="mb-4 grid grid-cols-2 gap-2 rounded-xl bg-slate-50 p-1 dark:bg-slate-700/30 sm:w-[440px]">
              <button type="button" onClick={() => trocarModo("cadastrado")} className={cx("rounded-lg px-3 py-2 text-sm font-medium", modoEntregador === "cadastrado" ? "bg-white text-[#7A1420] shadow-sm dark:bg-slate-800 dark:text-red-300" : "text-slate-500")}>Entregador cadastrado</button>
              <button type="button" onClick={() => trocarModo("avulso")} className={cx("rounded-lg px-3 py-2 text-sm font-medium", modoEntregador === "avulso" ? "bg-white text-[#7A1420] shadow-sm dark:bg-slate-800 dark:text-red-300" : "text-slate-500")}>Digitar nome na hora</button>
            </div>

            {modoEntregador === "avulso" && (
              <div className="mb-4 grid grid-cols-1 gap-3 rounded-xl border border-amber-200 bg-amber-50/70 p-4 dark:border-amber-500/20 dark:bg-amber-500/5 sm:grid-cols-2">
                <label className="text-xs text-slate-500">Nome do entregador avulso
                  <input value={nomeAvulso} onChange={evento => setNomeAvulso(evento.target.value)} disabled={Boolean(lista.length)} placeholder="Digite o nome" className={inputClass} />
                </label>
                <label className="text-xs text-slate-500">Empresa prestadora
                  <select value={empresaAvulsa} onChange={evento => setEmpresaAvulsa(evento.target.value)} disabled={Boolean(lista.length)} className={inputClass}>
                    {empresasOrdenadas.map(empresa => <option key={empresa}>{empresa}</option>)}
                  </select>
                </label>
              </div>
            )}

            <form onSubmit={adicionarCorrida} className="grid grid-cols-1 items-end gap-3 sm:grid-cols-2 xl:grid-cols-5">
              {modoEntregador === "cadastrado" && (
                <label className="text-xs text-slate-500">Entregador / empresa
                  <select value={entregadorId} onChange={evento => trocarEntregador(evento.target.value)} className={inputClass}>
                    {entregadoresAtivos.map(item => <option key={item.id} value={item.id}>{item.nome} — {item.tipo}</option>)}
                  </select>
                </label>
              )}
              <label className="text-xs text-slate-500">Bairro / destino
                <input value={bairro} onChange={evento => setBairro(evento.target.value)} list="destinos-motos" placeholder="Digite ou escolha o bairro" className={inputClass} />
                <datalist id="destinos-motos">{tarifas.map(item => <option key={item.bairro} value={item.bairro} />)}</datalist>
              </label>
              <label className="text-xs text-slate-500">Pedido (opcional)
                <input value={pedido} onChange={evento => setPedido(evento.target.value)} placeholder="#0000" className={inputClass} />
              </label>
              <div>
                <label className="mb-1 flex items-center gap-2 text-xs text-slate-500">
                  <input type="checkbox" checked={usaValorLivreEfetivo} disabled={modoEntregador === "avulso" || empresaTabelaObrigatoria} onChange={evento => setUsarValorLivre(evento.target.checked)} />
                  {empresaTabelaObrigatoria ? "Preço obrigatório da tabela" : "Valor livre (sem tabela)"}
                </label>
                {usaValorLivreEfetivo ? (
                  <input inputMode="decimal" value={valorLivre} onChange={evento => setValorLivre(evento.target.value)} placeholder="R$ 0,00" className={cx(inputClass, "mt-0")} />
                ) : (
                  <div className="rounded-xl bg-slate-50 px-3 py-2.5 dark:bg-slate-700/30">
                    <div className="text-[10px] uppercase text-slate-400">Preço da tabela</div>
                    <div className="text-sm font-semibold text-[#7A1420] dark:text-red-300">{valorTabela == null ? "Sem preço" : dinheiro(valorTabela)}</div>
                  </div>
                )}
              </div>
              <button className={primaryButton}><Plus size={15} className="mr-1 inline" />Adicionar</button>
            </form>
          </Card>

          <Card className="overflow-hidden">
            <div className="flex flex-col gap-2 border-b border-slate-100 p-4 dark:border-slate-700 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Lista aberta · {responsavelLista?.nome ?? entregadorCadastrado?.nome ?? "Selecione um entregador"}</h3>
                <p className="mt-0.5 text-xs text-slate-400">{lista.length} corrida(s) · {responsavelLista?.tipo ?? empresaCorrida ?? "—"}</p>
              </div>
              <div className="text-right">
                <div className="text-[10px] uppercase text-slate-400">Total a lançar</div>
                <div className="text-lg font-semibold text-[#7A1420] dark:text-red-300">{dinheiro(totalLista)}</div>
              </div>
            </div>
            {lista.length ? (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[620px] text-sm">
                    <thead><tr className="border-b border-slate-100 text-left text-xs uppercase text-slate-400 dark:border-slate-700"><th className="px-4 py-2.5 font-medium">#</th><th className="px-4 py-2.5 font-medium">Pedido</th><th className="px-4 py-2.5 font-medium">Bairro</th><th className="px-4 py-2.5 font-medium">Preço</th><th className="px-4 py-2.5 text-right font-medium">Valor</th><th className="px-4 py-2.5"></th></tr></thead>
                    <tbody>{lista.map((item, indice) => (
                      <tr key={item.id} className="border-b border-slate-50 dark:border-slate-700/50">
                        <td className="px-4 py-3 text-slate-400">{indice + 1}</td>
                        <td className="px-4 py-3 font-medium">{item.pedido}</td>
                        <td className="px-4 py-3 text-slate-500"><MapPin size={12} className="mr-1 inline" />{item.bairro}</td>
                        <td className="px-4 py-3"><Badge tone={item.origemValor === "livre" ? "amber" : "green"}>{item.origemValor === "livre" ? "Livre" : "Tabela"}</Badge></td>
                        <td className="px-4 py-3 text-right font-medium">{dinheiro(item.valor)}</td>
                        <td className="px-4 py-3 text-right"><button type="button" onClick={() => removerCorrida(item.id)} className="text-xs text-rose-500 hover:text-rose-700">Remover</button></td>
                      </tr>
                    ))}</tbody>
                  </table>
                </div>
                <div className="flex flex-col justify-end gap-2 p-4 sm:flex-row">
                  <button type="button" onClick={limparLista} className={secondaryButton}>Limpar lista</button>
                  <button type="button" onClick={finalizarLista} disabled={!caixaAberto} className={primaryButton}>Lançar {dinheiro(totalLista)} no caixa em nome de {responsavelLista?.nome}</button>
                </div>
              </>
            ) : <div className="p-8 text-center text-sm text-slate-400">Adicione as corridas desta lista.</div>}
          </Card>

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            <Card className="overflow-hidden">
              <div className="border-b border-slate-100 p-4 dark:border-slate-700"><h3 className="text-sm font-semibold text-slate-900 dark:text-white">Resumo por entregador</h3><p className="mt-0.5 text-xs text-slate-400">Cadastrados e avulsos por empresa prestadora</p></div>
              <div className="overflow-x-auto"><table className="w-full min-w-[500px] text-sm"><thead><tr className="border-b border-slate-100 text-left text-xs uppercase text-slate-400 dark:border-slate-700"><th className="px-4 py-2.5 font-medium">Entregador</th><th className="px-4 py-2.5 font-medium">Empresa</th><th className="px-4 py-2.5 text-right font-medium">Corridas</th><th className="px-4 py-2.5 text-right font-medium">Total</th></tr></thead><tbody>{resumoEntregadores.map(item => <tr key={`${item.entregador}-${item.empresa}`} className="border-b border-slate-50 dark:border-slate-700/50"><td className="px-4 py-3 font-medium">{item.entregador}</td><td className="px-4 py-3"><Badge tone="brand">{item.empresa}</Badge></td><td className="px-4 py-3 text-right">{item.corridas}</td><td className="px-4 py-3 text-right font-medium">{dinheiro(item.total)}</td></tr>)}</tbody></table></div>
            </Card>
            <Card className="overflow-hidden">
              <div className="border-b border-slate-100 p-4 dark:border-slate-700"><h3 className="text-sm font-semibold text-slate-900 dark:text-white">Histórico de corridas</h3><p className="mt-0.5 text-xs text-slate-400">Cada destino permanece disponível para os relatórios</p></div>
              <div className="max-h-[360px] overflow-x-auto"><table className="w-full min-w-[620px] text-sm"><thead><tr className="border-b border-slate-100 text-left text-xs uppercase text-slate-400 dark:border-slate-700"><th className="px-4 py-2.5 font-medium">Lote</th><th className="px-4 py-2.5 font-medium">Entregador</th><th className="px-4 py-2.5 font-medium">Bairro</th><th className="px-4 py-2.5 text-right font-medium">Valor</th><th className="px-4 py-2.5 font-medium">Caixa</th></tr></thead><tbody>{corridas.map(item => <tr key={item.id} className="border-b border-slate-50 dark:border-slate-700/50"><td className="px-4 py-3 font-mono text-xs text-slate-400">{item.loteId ?? item.id}</td><td className="px-4 py-3"><div className="font-medium">{item.entregador}</div><div className="text-xs text-slate-400">{item.empresa}</div></td><td className="px-4 py-3 text-slate-500">{item.bairro}</td><td className="px-4 py-3 text-right font-medium">{dinheiro(item.valor)}</td><td className="px-4 py-3"><Badge tone="green">{item.caixaId ?? "Pago"}</Badge></td></tr>)}</tbody></table></div>
            </Card>
          </div>
        </>
      )}

      {tab === "entregadores" && (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[380px_1fr]">
          <div className="flex flex-col gap-4">
            <Card className="p-5">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{entregadorEditandoId ? "Editar entregador" : "Cadastrar entregador"}</h3>
              <p className="mb-4 mt-0.5 text-xs text-slate-400">Vincule o profissional à empresa que presta o serviço</p>
              <form onSubmit={salvarEntregador} className="flex flex-col gap-3">
                <label className="text-xs text-slate-500">Nome do entregador<input value={formEntregador.nome} onChange={evento => setFormEntregador(atual => ({ ...atual, nome: evento.target.value }))} className={inputClass} /></label>
                <label className="text-xs text-slate-500">Telefone<input value={formEntregador.telefone} onChange={evento => setFormEntregador(atual => ({ ...atual, telefone: evento.target.value }))} placeholder="(35) 99999-9999" className={inputClass} /></label>
                <label className="text-xs text-slate-500">Empresa prestadora<select value={formEntregador.tipo} onChange={evento => setFormEntregador(atual => ({ ...atual, tipo: evento.target.value }))} className={inputClass}>{empresasOrdenadas.map(empresa => <option key={empresa}>{empresa}</option>)}</select></label>
                <div className="grid grid-cols-2 gap-2">
                  <button className={primaryButton}>{entregadorEditandoId ? "Salvar edição" : "Salvar entregador"}</button>
                  <button type="button" onClick={limparFormularioEntregador} className={secondaryButton}>{entregadorEditandoId ? "Cancelar" : "Limpar"}</button>
                </div>
              </form>
            </Card>

            <Card className="p-5">
              <div className="flex items-center gap-2"><Building2 size={17} className="text-[#7A1420] dark:text-red-300" /><h3 className="text-sm font-semibold text-slate-900 dark:text-white">Adicionar empresa</h3></div>
              <p className="mb-4 mt-1 text-xs text-slate-400">A nova empresa ficará disponível nos cadastros, corridas e tabela de preços</p>
              <form onSubmit={cadastrarEmpresa} className="flex gap-2">
                <input value={novaEmpresa} onChange={evento => setNovaEmpresa(evento.target.value)} placeholder="Nome da prestadora" className={cx(inputClass, "mt-0")} />
                <button className={primaryButton}><Plus size={15} /></button>
              </form>
              <div className="mt-3 flex flex-wrap gap-2">{empresasOrdenadas.map(empresa => <Badge key={empresa} tone="brand">{empresa}</Badge>)}</div>
            </Card>
          </div>

          <Card className="overflow-hidden">
            <div className="border-b border-slate-100 p-4 dark:border-slate-700"><h3 className="text-sm font-semibold text-slate-900 dark:text-white">Base de entregadores</h3><p className="mt-0.5 text-xs text-slate-400">Edite, inative ou exclua profissionais sem histórico</p></div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-sm">
                <thead><tr className="border-b border-slate-100 text-left text-xs uppercase text-slate-400 dark:border-slate-700"><th className="px-4 py-2.5 font-medium">Nome</th><th className="px-4 py-2.5 font-medium">Telefone</th><th className="px-4 py-2.5 font-medium">Empresa</th><th className="px-4 py-2.5 font-medium">Status</th><th className="px-4 py-2.5 text-right font-medium">Ações</th></tr></thead>
                <tbody>{entregadores.map(entregador => (
                  <tr key={entregador.id} className="border-b border-slate-50 dark:border-slate-700/50">
                    <td className="px-4 py-3"><div className="font-medium text-slate-800 dark:text-slate-200">{entregador.nome}</div><div className="font-mono text-[11px] text-slate-400">{entregador.id}</div></td>
                    <td className="px-4 py-3 text-slate-500">{entregador.telefone || "—"}</td>
                    <td className="px-4 py-3"><Badge tone="brand">{entregador.tipo}</Badge></td>
                    <td className="px-4 py-3"><Badge tone={entregador.ativo ? "green" : "slate"}>{entregador.ativo ? "Ativo" : "Inativo"}</Badge></td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <button type="button" title="Editar" onClick={() => editarEntregador(entregador)} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700"><Pencil size={15} /></button>
                        <button type="button" title={entregador.ativo ? "Inativar" : "Ativar"} onClick={() => alternarStatus(entregador)} className={cx("rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-slate-700", entregador.ativo ? "text-amber-600" : "text-emerald-600")}><Power size={15} /></button>
                        <button type="button" title="Excluir" onClick={() => excluirEntregador(entregador)} className="rounded-lg p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10"><Trash2 size={15} /></button>
                      </div>
                    </td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {tab === "tarifas" && (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[380px_1fr]">
          <Card className="p-5">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{bairroOriginal ? "Editar bairro" : "Adicionar bairro"}</h3>
            <p className="mb-4 mt-0.5 text-xs text-slate-400">Informe preços apenas para as empresas que atendem este destino</p>
            <form onSubmit={salvarTarifa} className="flex flex-col gap-3">
              <label className="text-xs text-slate-500">Bairro / destino<input id="bairro-tarifa-motos" value={bairroCadastro} onChange={evento => setBairroCadastro(evento.target.value)} placeholder="Nome do bairro" className={inputClass} /></label>
              {empresasOrdenadas.map(empresa => (
                <label key={empresa} className="text-xs text-slate-500">{empresa} (R$)<input inputMode="decimal" value={valoresCadastro[empresa] ?? ""} onChange={evento => setValoresCadastro(atual => ({ ...atual, [empresa]: evento.target.value }))} placeholder="0,00" className={inputClass} /></label>
              ))}
              <div className="grid grid-cols-2 gap-2"><button className={primaryButton}>{bairroOriginal ? "Salvar edição" : "Adicionar bairro"}</button><button type="button" onClick={limparTarifa} className={secondaryButton}>{bairroOriginal ? "Cancelar" : "Limpar"}</button></div>
            </form>
          </Card>

          <Card className="overflow-hidden">
            <div className="flex flex-col gap-3 border-b border-slate-100 p-4 dark:border-slate-700 sm:flex-row sm:items-center sm:justify-between">
              <div><h3 className="text-sm font-semibold text-slate-900 dark:text-white">Tabela comparativa por bairro</h3><p className="mt-0.5 text-xs text-slate-400">{tarifas.length} destinos · {empresasOrdenadas.length} empresas</p></div>
              <div className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 dark:bg-slate-700/40"><Search size={14} className="text-slate-400" /><input value={buscaTarifa} onChange={evento => setBuscaTarifa(evento.target.value)} placeholder="Buscar bairro..." className="w-44 bg-transparent text-sm outline-none" /></div>
            </div>
            <div className="max-h-[680px] overflow-auto">
              <table className="w-full min-w-[720px] text-sm">
                <thead className="sticky top-0 z-10 bg-white dark:bg-slate-800"><tr className="border-b border-slate-100 text-left text-xs uppercase text-slate-400 dark:border-slate-700"><th className="px-4 py-2.5 font-medium">Bairro / destino</th>{empresasOrdenadas.map(empresa => <th key={empresa} className="px-4 py-2.5 text-right font-medium">{empresa}</th>)}<th className="px-4 py-2.5 text-right font-medium">Melhor</th><th className="px-4 py-2.5"></th></tr></thead>
                <tbody>{tarifasFiltradas.map(tarifa => {
                  const disponiveis = Object.values(tarifa.valores || {}).map(Number).filter(valor => valor > 0);
                  const menor = disponiveis.length ? Math.min(...disponiveis) : null;
                  return (
                    <tr key={tarifa.bairro} className="border-b border-slate-50 dark:border-slate-700/50">
                      <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-200">{tarifa.bairro}</td>
                      {empresasOrdenadas.map(empresa => <td key={empresa} className={cx("px-4 py-3 text-right", Number(tarifa.valores?.[empresa]) === menor ? "font-semibold text-emerald-600" : "text-slate-500")}>{tarifa.valores?.[empresa] ? dinheiro(tarifa.valores[empresa]) : "—"}</td>)}
                      <td className="px-4 py-3 text-right">{menor == null ? "—" : <Badge tone="green">{dinheiro(menor)}</Badge>}</td>
                      <td className="px-4 py-3 text-right"><button type="button" onClick={() => editarTarifa(tarifa)} className="rounded-lg border border-[#7A1420]/30 bg-red-50 px-3 py-1.5 text-xs font-medium text-[#7A1420] hover:bg-red-100 dark:bg-red-500/10 dark:text-red-300"><Pencil size={12} className="mr-1 inline" />Editar</button></td>
                    </tr>
                  );
                })}</tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {tab === "relatorios" && (
        <>
          <Card className="p-5">
            <div className="mb-4 flex items-center gap-2"><Filter size={17} className="text-[#7A1420] dark:text-red-300" /><div><h3 className="text-sm font-semibold text-slate-900 dark:text-white">Filtros do relatório</h3><p className="text-xs text-slate-400">Combine período, bairro, prestadora e entregador</p></div></div>
            <div className="grid grid-cols-1 items-end gap-3 sm:grid-cols-2 xl:grid-cols-6">
              <label className="text-xs text-slate-500">Data inicial<input type="date" value={filtroInicio} onChange={evento => setFiltroInicio(evento.target.value)} className={inputClass} /></label>
              <label className="text-xs text-slate-500">Data final<input type="date" value={filtroFim} onChange={evento => setFiltroFim(evento.target.value)} className={inputClass} /></label>
            <div className="mb-4 flex justify-end">
              <button type="button" onClick={gerarPdfRelatorio} disabled={!corridasFiltradas.length} className={primaryButton}><Download size={15} className="mr-1.5 inline" />Gerar PDF com gráficos</button>
            </div>
              <label className="text-xs text-slate-500">Bairro<select value={filtroBairro} onChange={evento => setFiltroBairro(evento.target.value)} className={inputClass}><option value="">Todos</option>{opcoesRelatorio.bairros.map(item => <option key={item}>{item}</option>)}</select></label>
              <label className="text-xs text-slate-500">Empresa prestadora<select value={filtroEmpresa} onChange={evento => setFiltroEmpresa(evento.target.value)} className={inputClass}><option value="">Todas</option>{opcoesRelatorio.empresas.map(item => <option key={item}>{item}</option>)}</select></label>
              <label className="text-xs text-slate-500">Entregador<select value={filtroEntregador} onChange={evento => setFiltroEntregador(evento.target.value)} className={inputClass}><option value="">Todos</option>{opcoesRelatorio.entregadores.map(item => <option key={item}>{item}</option>)}</select></label>
              <button type="button" onClick={limparFiltros} className={secondaryButton}><X size={14} className="mr-1 inline" />Limpar filtros</button>
            </div>
          </Card>

          <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
            <Kpi label="Corridas filtradas" value={String(corridasFiltradas.length)} detail="No período selecionado" icon={Bike} />
            <Kpi label="Recebido dos clientes" value={dinheiro(totalRecebidoCliente)} detail="Taxas de entrega cobradas" icon={CircleDollarSign} />
            <Kpi label="Pago às motos" value={dinheiro(totalRelatorio)} detail="Custo das corridas" icon={Bike} />
            <Kpi label="Saldo das taxas" value={dinheiro(saldoTaxasEntrega)} detail="Recebido menos pago" icon={BarChart3} />
            <Kpi label="Custo médio" value={dinheiro(corridasFiltradas.length ? totalRelatorio / corridasFiltradas.length : 0)} detail="Por entrega" icon={FileBarChart2} />
          </div>

          <Card className="overflow-hidden">
            <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-end sm:justify-between dark:border-slate-700">
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Ordens de pagamento das motos</h3>
                <p className="mt-1 text-xs text-slate-400">Fechamento diário das entregas concluídas, uma ordem por entregador</p>
              </div>
              <div className="flex flex-wrap items-end gap-2">
                <label className="text-xs text-slate-500">Dia do fechamento<input type="date" value={dataFechamento} onChange={evento => setDataFechamento(evento.target.value)} className={inputClass} /></label>
                <button type="button" onClick={gerarOrdensPagamento} disabled={processandoOrdens || !api.enabled} className={primaryButton}>{processandoOrdens ? "Gerando..." : "Gerar ordens do dia"}</button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px] text-sm">
                <thead><tr className="border-b border-slate-100 text-left text-xs uppercase text-slate-400 dark:border-slate-700"><th className="px-4 py-2.5 font-medium">Ordem</th><th className="px-4 py-2.5 font-medium">Entregador</th><th className="px-4 py-2.5 text-right font-medium">Corridas</th><th className="px-4 py-2.5 text-right font-medium">Recebido clientes</th><th className="px-4 py-2.5 text-right font-medium">Pagar moto</th><th className="px-4 py-2.5 text-right font-medium">Saldo</th><th className="px-4 py-2.5 text-right font-medium">Status</th></tr></thead>
                <tbody>{ordensPagamento.map(ordem => (
                  <tr key={ordem.id} className="border-b border-slate-50 dark:border-slate-700/50">
                    <td className="px-4 py-3 font-mono text-xs">{ordem.codigo}</td>
                    <td className="px-4 py-3"><strong>{ordem.entregador?.nome}</strong><div className="text-xs text-slate-400">{ordem.entregador?.empresa}</div></td>
                    <td className="px-4 py-3 text-right">{ordem.quantidadeCorridas}</td>
                    <td className="px-4 py-3 text-right text-emerald-700">{dinheiro(ordem.totalTaxasCliente)}</td>
                    <td className="px-4 py-3 text-right font-semibold">{dinheiro(ordem.total)}</td>
                    <td className={`px-4 py-3 text-right font-semibold ${ordem.saldoTaxas >= 0 ? "text-emerald-700" : "text-rose-600"}`}>{dinheiro(ordem.saldoTaxas)}</td>
                    <td className="px-4 py-3 text-right">{ordem.status === "PAGA" ? <Badge tone="green">Paga</Badge> : <button type="button" onClick={() => marcarOrdemPaga(ordem.id)} className="rounded-lg border border-emerald-300 px-3 py-1.5 text-xs font-medium text-emerald-700">Marcar paga</button>}</td>
                  </tr>
                ))}</tbody>
              </table>
              {!ordensPagamento.length && <div className="p-8 text-center text-sm text-slate-400">Selecione o dia e gere o fechamento após concluir as entregas.</div>}
            </div>
          </Card>

          <Card className="overflow-hidden">
            <div className="border-b border-slate-100 p-4 dark:border-slate-700">
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            <Card className="p-5">
              <div className="mb-4"><h3 className="text-sm font-semibold text-slate-900 dark:text-white">Comparação por empresa prestadora</h3><p className="text-xs text-slate-400">Gasto total das motos nos filtros selecionados</p></div>
              <div className="flex flex-col gap-4">
                {comparativoEmpresas.slice(0, 10).map(item => <div key={item.nome}>
                  <div className="mb-1 flex items-center justify-between gap-3 text-xs"><span className="truncate font-medium text-slate-700 dark:text-slate-200">{item.nome}</span><span className="whitespace-nowrap font-semibold text-[#7A1420] dark:text-red-300">{dinheiro(item.total)}</span></div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700"><div className="h-full rounded-full bg-gradient-to-r from-[#7A1420] to-[#B42336]" style={{ width: `${Math.max(2, (item.total / maiorEmpresa) * 100)}%` }} /></div>
                  <div className="mt-1 text-[11px] text-slate-400">{item.corridas} corrida(s) · média {dinheiro(item.corridas ? item.total / item.corridas : 0)}</div>
                </div>)}
                {!comparativoEmpresas.length && <div className="py-8 text-center text-sm text-slate-400">Nenhuma empresa encontrada.</div>}
              </div>
            </Card>

            <Card className="p-5">
              <div className="mb-4"><h3 className="text-sm font-semibold text-slate-900 dark:text-white">Comparação por entregador</h3><p className="text-xs text-slate-400">Cadastrados e avulsos ordenados pelo maior gasto</p></div>
              <div className="flex flex-col gap-4">
                {comparativoEntregadores.slice(0, 10).map(item => <div key={item.nome}>
                  <div className="mb-1 flex items-center justify-between gap-3 text-xs"><span className="truncate font-medium text-slate-700 dark:text-slate-200">{item.nome}</span><span className="whitespace-nowrap font-semibold text-[#7A1420] dark:text-red-300">{dinheiro(item.total)}</span></div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700"><div className="h-full rounded-full bg-gradient-to-r from-[#7A1420] to-[#B42336]" style={{ width: `${Math.max(2, (item.total / maiorEntregador) * 100)}%` }} /></div>
                  <div className="mt-1 text-[11px] text-slate-400">{item.corridas} corrida(s) · média {dinheiro(item.corridas ? item.total / item.corridas : 0)}</div>
                </div>)}
                {!comparativoEntregadores.length && <div className="py-8 text-center text-sm text-slate-400">Nenhum entregador encontrado.</div>}
              </div>
            </Card>
          </div>

              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Relatório consolidado</h3>
              <p className="mt-0.5 text-xs text-slate-400">Quanto entrou de taxa, quanto foi pago à moto e o saldo por combinação</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[960px] text-sm">
                <thead><tr className="border-b border-slate-100 text-left text-xs uppercase text-slate-400 dark:border-slate-700"><th className="px-4 py-2.5 font-medium">Bairro</th><th className="px-4 py-2.5 font-medium">Empresa prestadora</th><th className="px-4 py-2.5 font-medium">Entregador</th><th className="px-4 py-2.5 text-right font-medium">Corridas</th><th className="px-4 py-2.5 text-right font-medium">Recebido cliente</th><th className="px-4 py-2.5 text-right font-medium">Pago moto</th><th className="px-4 py-2.5 text-right font-medium">Saldo</th></tr></thead>
                <tbody>{consolidadoRelatorio.map(item => (
                  <tr key={`${item.bairro}-${item.empresa}-${item.entregador}`} className="border-b border-slate-50 dark:border-slate-700/50">
                    <td className="px-4 py-3 font-medium"><MapPin size={12} className="mr-1 inline text-slate-400" />{item.bairro}</td>
                    <td className="px-4 py-3"><Badge tone="brand">{item.empresa}</Badge></td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{item.entregador}</td>
                    <td className="px-4 py-3 text-right">{item.corridas}</td>
                    <td className="px-4 py-3 text-right text-emerald-700">{dinheiro(item.recebidoCliente)}</td>
                    <td className="px-4 py-3 text-right font-semibold">{dinheiro(item.pagoMoto)}</td>
                    <td className={`px-4 py-3 text-right font-semibold ${item.saldo >= 0 ? "text-emerald-700" : "text-rose-600"}`}>{dinheiro(item.saldo)}</td>
                  </tr>
                ))}</tbody>
                {consolidadoRelatorio.length > 0 && <tfoot><tr className="bg-slate-50 font-semibold dark:bg-slate-700/30"><td colSpan={3} className="px-4 py-3">Total filtrado</td><td className="px-4 py-3 text-right">{corridasFiltradas.length}</td><td className="px-4 py-3 text-right text-emerald-700">{dinheiro(totalRecebidoCliente)}</td><td className="px-4 py-3 text-right">{dinheiro(totalRelatorio)}</td><td className={`px-4 py-3 text-right ${saldoTaxasEntrega >= 0 ? "text-emerald-700" : "text-rose-600"}`}>{dinheiro(saldoTaxasEntrega)}</td></tr></tfoot>}
              </table>
              {!consolidadoRelatorio.length && <div className="p-10 text-center text-sm text-slate-400">Nenhuma corrida encontrada com estes filtros.</div>}
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
