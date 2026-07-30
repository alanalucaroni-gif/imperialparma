"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  Bike,
  CheckCircle2,
  Clock3,
  Code2,
  Copy,
  ExternalLink,
  Link2,
  MapPin,
  Navigation,
  PackageCheck,
  Plus,
  Radio,
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
import { api } from "./api.ts";
import { contratoPedidoSischef } from "./logisticaSischef.js";
import { calcularCustoDespacho, empresaUsaPrecoTabela } from "./regraCustoEntrega.js";

const inputClass = "mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2.5 text-sm outline-none focus:border-[#7A1420]";
const primaryButton = "rounded-xl bg-[#7A1420] hover:bg-[#611018] disabled:cursor-not-allowed disabled:opacity-40 px-4 py-2.5 text-sm font-medium text-white";
const secondaryButton = "rounded-xl border border-slate-200 dark:border-slate-600 px-4 py-2.5 text-sm hover:bg-slate-50 dark:hover:bg-slate-700/40";
const configuracaoInicial = {
  enderecoOrigem: "Rua Assis Figueiredo, 555, Loja 2, Centro, Poços de Caldas - MG",
  tipoCalculoDistancia: "ida",
  valorKm: 2.5,
  valorMinimo: 8,
  raioMaximoKm: 12,
};

const statusConfig = {
  AGUARDANDO: { label: "Aguardando despacho", tone: "amber" },
  EM_PREPARO: { label: "Em preparo", tone: "amber" },
  PRONTO: { label: "Pronto para despacho", tone: "blue" },
  COLETA: { label: "Aguardando coleta", tone: "blue" },
  NA_LOJA: { label: "Entregador na loja", tone: "blue" },
  EM_ROTA: { label: "Em rota", tone: "brand" },
  NO_DESTINO: { label: "No destino", tone: "brand" },
  ENTREGUE: { label: "Entregue", tone: "green" },
  PROBLEMA: { label: "Com problema", tone: "red" },
  RETORNANDO: { label: "Retornando", tone: "amber" },
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

const statusLogisticaValidos = new Set([
  "AGUARDANDO",
  "EM_PREPARO",
  "PRONTO",
  "COLETA",
  "NA_LOJA",
  "EM_ROTA",
  "NO_DESTINO",
  "ENTREGUE",
  "PROBLEMA",
  "CANCELADO",
  "RETORNANDO",
]);

function mensagemErro(error, fallback = "Não foi possível concluir a operação.") {
  return error?.message || fallback;
}

function pedidoParaCriacaoApi(pedido) {
  return {
    idExterno: pedido.idExterno || undefined,
    codigoPedido: pedido.codigoPedido,
    clienteNome: pedido.clienteNome,
    clienteTelefone: pedido.clienteTelefone || undefined,
    endereco: pedido.endereco,
    complemento: pedido.complemento || undefined,
    referencia: pedido.referencia || undefined,
    bairro: pedido.bairro,
    canal: pedido.canal,
    formaPagamento: pedido.formaPagamento,
    valorPedido: Number(pedido.valorPedido || 0),
    taxaEntregaCliente: Number(pedido.taxaEntregaCliente || 0),
    distanciaKm: Number(pedido.distanciaKm || 0),
    distanciaCobradaKm: pedido.distanciaCobradaKm == null ? null : Number(pedido.distanciaCobradaKm),
    duracaoEstimadaMinutos: pedido.rotaCalculada?.duracaoMinutos == null
      ? undefined
      : Number(pedido.rotaCalculada.duracaoMinutos),
    enderecoOrigem: pedido.enderecoOrigem,
    tipoCalculoDistancia: pedido.tipoCalculoDistancia,
    origemDistancia: pedido.origemDistancia,
    rotaCalculada: pedido.rotaCalculada || undefined,
    custoEstimado: Number(pedido.custoEstimado || 0),
    custoReal: pedido.custoReal == null ? null : Number(pedido.custoReal),
    origemValor: pedido.origemValor || undefined,
    tabelaEmpresa: pedido.tabelaEmpresa || undefined,
    observacoes: pedido.observacoes || undefined,
    origem: pedido.origem || "MANUAL",
  };
}

function pedidoParaImportacaoApi(pedido) {
  return {
    ...pedidoParaCriacaoApi(pedido),
    idLegado: pedido.id,
    status: statusLogisticaValidos.has(pedido.status) ? pedido.status : "AGUARDANDO",
    entregador: pedido.entregador ? {
      id: pedido.entregador.id,
      nome: pedido.entregador.nome,
      empresa: pedido.entregador.empresa || pedido.entregador.tipo || "Frota Imperial",
      telefone: pedido.entregador.telefone || undefined,
    } : undefined,
    historico: (pedido.historico || [])
      .filter(item => statusLogisticaValidos.has(item.status))
      .map(item => ({
        status: item.status,
        descricao: item.descricao || undefined,
        em: item.em || undefined,
        dados: item.dados || undefined,
      })),
    ocorrencia: pedido.ocorrencia || undefined,
    criadoEm: pedido.criadoEm || undefined,
    atualizadoEm: pedido.atualizadoEm || undefined,
    atribuidoEm: pedido.atribuidoEm || undefined,
    coletadoEm: pedido.coletadoEm || undefined,
    saiuEntregaEm: pedido.saiuEntregaEm || undefined,
    entregueEm: pedido.entregueEm || undefined,
    canceladoEm: pedido.canceladoEm || undefined,
  };
}

const formularioInicial = {
  codigoPedido: "",
  clienteNome: "",
  clienteTelefone: "",
  endereco: "",
  bairro: "",
  canal: "Direto",
  formaPagamento: "PIX",
  valorPedido: "",
  taxaEntregaCliente: "",
  distanciaKm: "",
  observacoes: "",
};

export default function CentralLogistica({ entregadores, tarifas = [], onConcluirEntrega }) {
  const [aba, setAba] = useState("painel");
  const [pedidos, setPedidos] = useState(() => carregar("imperial.logisticsOrders.v1", []));
  const [configuracao, setConfiguracao] = useState(() => ({
    ...configuracaoInicial,
    ...carregar("imperial.logisticsSettings.v1", {}),
  }));
  const [form, setForm] = useState(formularioInicial);
  const [atribuicoes, setAtribuicoes] = useState({});
  const [busca, setBusca] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [linksPedido, setLinksPedido] = useState(null);
  const [gerandoLinksId, setGerandoLinksId] = useState("");
  const [rotaFeedback, setRotaFeedback] = useState(null);
  const [rotaCalculada, setRotaCalculada] = useState(null);
  const [calculandoDistancia, setCalculandoDistancia] = useState(false);
  const [carregandoDados, setCarregandoDados] = useState(api.enabled);
  const requisicaoRota = useRef(0);
  const entregasRegistradas = useRef(new Set());

  useEffect(() => {
    if (!api.enabled) return undefined;
    let montado = true;

    async function carregarPersistencia() {
      setCarregandoDados(true);
      try {
        const pedidosLegados = carregar("imperial.logisticsOrders.v1", []);
        const configuracaoSalva = localStorage.getItem("imperial.logisticsSettings.v1");
        const configuracaoJaMigrada = localStorage.getItem("imperial.logisticsSettingsMigrated.v1") === "ok";
        const pedidosValidos = pedidosLegados.filter(pedido =>
          pedido?.id
          && pedido?.clienteNome?.trim()
          && pedido?.endereco?.trim()
          && pedido?.bairro?.trim()
          && numero(pedido?.distanciaKm) > 0
        );
        const payloadImportacao = {
          pedidos: pedidosValidos.map(pedidoParaImportacaoApi),
          ...(configuracaoSalva && !configuracaoJaMigrada ? {
            configuracao: {
              enderecoOrigem: configuracao.enderecoOrigem,
              tipoCalculoDistancia: configuracao.tipoCalculoDistancia,
              valorKm: numero(configuracao.valorKm),
              valorMinimo: numero(configuracao.valorMinimo),
              raioMaximoKm: numero(configuracao.raioMaximoKm),
            },
          } : {}),
        };

        let resultadoImportacao = null;
        if (payloadImportacao.pedidos.length || payloadImportacao.configuracao) {
          resultadoImportacao = await api.importarLogistica(payloadImportacao);
          if (payloadImportacao.configuracao) {
            localStorage.setItem("imperial.logisticsSettingsMigrated.v1", "ok");
          }
        }
        const [lista, configuracaoPersistida] = await Promise.all([
          api.getPedidosLogistica({ limit: 200 }),
          api.getConfiguracaoLogistica(),
        ]);
        if (!montado) return;
        setPedidos(lista.data || []);
        setConfiguracao(configuracaoPersistida);
        if (resultadoImportacao?.importados) {
          setFeedback({
            tone: "green",
            text: `${resultadoImportacao.importados} pedido(s) anterior(es) foram preservados no banco de dados.`,
          });
        }
      } catch (error) {
        if (!montado) return;
        setFeedback({
          tone: "red",
          text: `${mensagemErro(error, "Não foi possível carregar a logística do banco.")} Os dados locais foram mantidos.`,
        });
      } finally {
        if (montado) setCarregandoDados(false);
      }
    }

    carregarPersistencia();
    return () => { montado = false; };
  }, []);

  useEffect(() => {
    if (!api.enabled) return undefined;
    let montado = true;
    const atualizarPainel = async () => {
      try {
        const lista = await api.getPedidosLogistica({ limit: 200 });
        if (montado) setPedidos(lista.data || []);
      } catch {
        // A sincronizacao inicial exibe o erro; o painel tenta novamente.
      }
    };
    const timer = window.setInterval(atualizarPainel, 10_000);
    return () => {
      montado = false;
      window.clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    if (typeof onConcluirEntrega !== "function") return;
    pedidos
      .filter(pedido => pedido.status === "ENTREGUE" && pedido.entregador)
      .forEach(pedido => {
        if (entregasRegistradas.current.has(pedido.id)) return;
        entregasRegistradas.current.add(pedido.id);
        const resultado = onConcluirEntrega({
          pedido,
          entregador: {
            id: pedido.entregador.id,
            nome: pedido.entregador.nome,
            tipo: pedido.entregador.empresa,
          },
          custo: Number(pedido.custoReal ?? pedido.custoEstimado ?? 0),
        });
        if (resultado?.tone === "red") {
          entregasRegistradas.current.delete(pedido.id);
          setFeedback(resultado);
        }
      });
  }, [pedidos, onConcluirEntrega]);

  const ativos = entregadores.filter(item => item.ativo);
  const bairros = useMemo(() => [...new Set(tarifas.map(item => item.bairro).filter(Boolean))]
    .sort((a, b) => a.localeCompare(b, "pt-BR")), [tarifas]);
  const ocupados = new Set(pedidos.filter(item => ["COLETA", "NA_LOJA", "EM_ROTA", "NO_DESTINO", "PROBLEMA", "RETORNANDO"].includes(item.status)).map(item => item.entregador?.id).filter(Boolean));
  const disponiveis = ativos.filter(item => !ocupados.has(item.id));

  const pedidosFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    if (!termo) return pedidos;
    return pedidos.filter(item => [item.codigoPedido, item.clienteNome, item.bairro, item.endereco, item.entregador?.nome]
      .some(valor => String(valor || "").toLowerCase().includes(termo)));
  }, [pedidos, busca]);

  const grupos = {
    AGUARDANDO: pedidosFiltrados.filter(item => ["AGUARDANDO", "EM_PREPARO", "PRONTO"].includes(item.status)),
    COLETA: pedidosFiltrados.filter(item => ["COLETA", "NA_LOJA"].includes(item.status)),
    EM_ROTA: pedidosFiltrados.filter(item => ["EM_ROTA", "NO_DESTINO", "PROBLEMA", "RETORNANDO"].includes(item.status)),
    ENTREGUE: pedidosFiltrados.filter(item => ["ENTREGUE", "CANCELADO"].includes(item.status)).slice(0, 20),
  };

  const entreguesHoje = pedidos.filter(item => item.status === "ENTREGUE" && hoje(item.entregueEm));
  const gastoHoje = entreguesHoje.reduce((total, item) => total + Number(item.custoReal ?? item.custoEstimado ?? 0), 0);
  const emOperacao = pedidos.filter(item => ["COLETA", "NA_LOJA", "EM_ROTA", "NO_DESTINO", "PROBLEMA", "RETORNANDO"].includes(item.status));
  const atrasados = emOperacao.filter(item => Date.now() - new Date(item.atualizadoEm).getTime() > 45 * 60 * 1000);

  function atualizarPedidosLocal(transformar) {
    setPedidos(atuais => salvar("imperial.logisticsOrders.v1", transformar(atuais)));
  }

  function aplicarPedidoAtualizado(pedido) {
    setPedidos(atuais => [pedido, ...atuais.filter(item => item.id !== pedido.id)]);
  }

  function distanciaCobrada(distancia) {
    const multiplicador = configuracao.tipoCalculoDistancia === "ida_volta" ? 2 : 1;
    return numero(distancia) * multiplicador;
  }

  function custoPara(distancia) {
    return Math.max(numero(configuracao.valorMinimo), distanciaCobrada(distancia) * numero(configuracao.valorKm));
  }

  function destinoDaRota(bairro, endereco) {
    const partes = [];
    if (endereco?.trim()) partes.push(endereco.trim());
    if (bairro?.trim()) partes.push(bairro.trim());
    partes.push("Poços de Caldas - MG");
    return partes.join(", ");
  }

  async function calcularDistanciaAutomatica(bairro, endereco = "") {
    if (!bairro?.trim()) return;
    const idRequisicao = ++requisicaoRota.current;
    setCalculandoDistancia(true);
    setRotaFeedback({ tone: "amber", text: endereco.trim() ? "Calculando a rota até o endereço..." : "Calculando a rota até o centro do bairro..." });
    try {
      const rota = await api.calcularDistanciaLogistica({
        origem: configuracao.enderecoOrigem,
        destino: destinoDaRota(bairro, endereco),
        modo: "TWO_WHEELER",
      });
      if (idRequisicao !== requisicaoRota.current) return;
      setForm(atual => atual.bairro === bairro ? { ...atual, distanciaKm: String(rota.distanciaKm).replace(".", ",") } : atual);
      setRotaCalculada(rota);
      setRotaFeedback({
        tone: "green",
        text: `${rota.distanciaKm.toLocaleString("pt-BR")} km · cerca de ${rota.duracaoMinutos} min${endereco.trim() ? " · endereço exato" : " · centro do bairro"}`,
      });
    } catch (error) {
      if (idRequisicao !== requisicaoRota.current) return;
      setRotaCalculada(null);
      setRotaFeedback({ tone: "red", text: error?.message || "Não foi possível calcular a rota automaticamente." });
    } finally {
      if (idRequisicao === requisicaoRota.current) setCalculandoDistancia(false);
    }
  }

  function selecionarBairro(evento) {
    const bairro = evento.target.value;
    setForm(atual => ({ ...atual, bairro, distanciaKm: "" }));
    setRotaCalculada(null);
    setRotaFeedback(null);
    if (bairro) calcularDistanciaAutomatica(bairro, form.endereco);
  }

  function rotuloEntregador(entregador, pedido) {
    const custo = calcularCustoDespacho({ pedido, entregador, tarifas });
    if (empresaUsaPrecoTabela(entregador.tipo)) {
      const detalhe = custo.erro ? "sem preço para o bairro" : `tabela ${dinheiro(custo.valor)}`;
      return `${entregador.nome} · ${entregador.tipo} · ${detalhe}`;
    }
    return `${entregador.nome} · ${entregador.tipo} · por km`;
  }

  async function salvarConfiguracao(evento) {
    evento.preventDefault();
    const proxima = {
      enderecoOrigem: configuracao.enderecoOrigem.trim(),
      tipoCalculoDistancia: configuracao.tipoCalculoDistancia === "ida_volta" ? "ida_volta" : "ida",
      valorKm: numero(configuracao.valorKm),
      valorMinimo: numero(configuracao.valorMinimo),
      raioMaximoKm: numero(configuracao.raioMaximoKm),
    };
    try {
      if (api.enabled) {
        setConfiguracao(await api.salvarConfiguracaoLogistica(proxima));
        localStorage.setItem("imperial.logisticsSettingsMigrated.v1", "ok");
      } else {
        setConfiguracao(salvar("imperial.logisticsSettings.v1", proxima));
      }
      setFeedback({
        tone: "green",
        text: `Parâmetros da logística própria foram salvos ${api.enabled ? "no banco" : "neste navegador"}.`,
      });
    } catch (error) {
      setFeedback({ tone: "red", text: mensagemErro(error, "Não foi possível salvar os parâmetros da logística.") });
    }
  }

  async function cadastrarPedido(evento) {
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
    const idLocal = `LOG-${Date.now()}`;
    const novo = {
      id: idLocal,
      idExterno: idLocal,
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
      distanciaCobradaKm: distanciaCobrada(distancia),
      enderecoOrigem: configuracao.enderecoOrigem,
      tipoCalculoDistancia: configuracao.tipoCalculoDistancia,
      origemDistancia: rotaCalculada ? "GOOGLE_MAPS_ROUTES" : "MANUAL",
      rotaCalculada,
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
    try {
      const persistido = api.enabled
        ? await api.cadastrarPedidoLogistica(pedidoParaCriacaoApi(novo))
        : novo;
      if (api.enabled) aplicarPedidoAtualizado(persistido);
      else atualizarPedidosLocal(atuais => [novo, ...atuais]);
      setForm(formularioInicial);
      setRotaCalculada(null);
      setRotaFeedback(null);
      setAba("painel");
      setFeedback({
        tone: "green",
        text: `${persistido.codigoPedido} entrou na fila e foi salvo ${api.enabled ? "no banco" : "neste navegador"}.`,
      });
    } catch (error) {
      atualizarPedidosLocal(atuais => [novo, ...atuais.filter(item => item.id !== novo.id)]);
      setFeedback({
        tone: "red",
        text: `${mensagemErro(error, "Não foi possível salvar o pedido na API.")} O preenchimento foi preservado localmente para nova tentativa.`,
      });
    }
  }

  async function alterarStatus(id, status, descricao, extras = {}) {
    if (!api.enabled) {
      atualizarPedidosLocal(atuais => atuais.map(item => item.id === id ? {
        ...item,
        ...extras,
        status,
        atualizadoEm: dataHora(),
        historico: [...(item.historico || []), { status, em: dataHora(), descricao }],
      } : item));
      return true;
    }
    try {
      const atualizado = await api.atualizarStatusPedidoLogistica(id, {
        status,
        descricao,
        ...("entregador" in extras ? { entregador: extras.entregador } : {}),
        ...("custoEstimado" in extras ? { custoEstimado: extras.custoEstimado } : {}),
        ...("custoReal" in extras ? { custoReal: extras.custoReal } : {}),
        ...("origemValor" in extras ? { origemValor: extras.origemValor } : {}),
        ...("tabelaEmpresa" in extras ? { tabelaEmpresa: extras.tabelaEmpresa } : {}),
        ...("distanciaCobradaKm" in extras ? { distanciaCobradaKm: extras.distanciaCobradaKm } : {}),
        ...("ocorrencia" in extras ? { ocorrencia: extras.ocorrencia } : {}),
      });
      aplicarPedidoAtualizado(atualizado);
      return true;
    } catch (error) {
      setFeedback({ tone: "red", text: mensagemErro(error, "Não foi possível atualizar a etapa da entrega.") });
      return false;
    }
  }

  async function abrirLinks(pedido) {
    if (!api.enabled) {
      setFeedback({ tone: "red", text: "Os links móveis exigem a API publicada." });
      return;
    }
    setGerandoLinksId(pedido.id);
    try {
      const links = await api.gerarLinksPedidoLogistica(pedido.id);
      setLinksPedido(links);
      setFeedback({ tone: "green", text: `Links seguros de ${pedido.codigoPedido} gerados com sucesso.` });
    } catch (error) {
      setFeedback({ tone: "red", text: mensagemErro(error, "Não foi possível gerar os links da entrega.") });
    } finally {
      setGerandoLinksId("");
    }
  }

  async function copiarLink(url, nome) {
    try {
      await navigator.clipboard.writeText(url);
      setFeedback({ tone: "green", text: `${nome} copiado para a área de transferência.` });
    } catch {
      setFeedback({ tone: "red", text: "Não foi possível copiar automaticamente. Selecione o endereço do campo." });
    }
  }

  function compartilharRastreioWhatsapp() {
    if (!linksPedido?.rastreioUrl) return;
    const mensagem = encodeURIComponent(
      `Olá! Acompanhe a entrega ${linksPedido.codigoPedido} da Imperial Parma: ${linksPedido.rastreioUrl}`,
    );
    window.open(`https://wa.me/?text=${mensagem}`, "_blank", "noopener,noreferrer");
  }

  async function despachar(pedido) {
    const entregadorId = atribuicoes[pedido.id];
    const entregador = ativos.find(item => item.id === entregadorId);
    if (!entregador) {
      setFeedback({ tone: "red", text: "Selecione um entregador ativo para despachar." });
      return;
    }
    const custo = calcularCustoDespacho({ pedido, entregador, tarifas });
    if (custo.erro) {
      setFeedback({ tone: "red", text: custo.erro });
      return;
    }
    const descricaoCusto = custo.origemValor === "tabela"
      ? `preço de tabela ${entregador.tipo}`
      : "cálculo por quilômetro";
    const atualizado = await alterarStatus(pedido.id, "COLETA", `Pedido atribuído a ${entregador.nome} com ${descricaoCusto}.`, {
      entregador: { id: entregador.id, nome: entregador.nome, empresa: entregador.tipo },
      atribuidoEm: dataHora(),
      custoEstimado: custo.valor,
      origemValor: custo.origemValor,
      tabelaEmpresa: custo.empresaTabela,
      distanciaCobradaKm: custo.origemValor === "tabela" ? null : pedido.distanciaCobradaKm,
    });
    if (atualizado) {
      setFeedback({ tone: "green", text: `${pedido.codigoPedido} atribuído a ${entregador.nome} por ${dinheiro(custo.valor)} (${descricaoCusto}).` });
      await abrirLinks(pedido);
    }
  }

  async function confirmarColeta(pedido) {
    const atualizado = await alterarStatus(pedido.id, "EM_ROTA", "Pedido coletado e saiu para entrega.", { coletadoEm: dataHora(), saiuEntregaEm: dataHora() });
    if (atualizado) setFeedback({ tone: "green", text: `${pedido.codigoPedido} saiu para entrega.` });
  }

  async function concluirEntrega(pedido) {
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
    const atualizado = await alterarStatus(pedido.id, "ENTREGUE", "Entrega concluída.", { entregueEm: dataHora(), custoReal: Number(pedido.custoEstimado || 0) });
    if (atualizado) setFeedback(resultado);
  }

  async function registrarProblema(pedido) {
    const descricao = window.prompt("Descreva o problema da entrega:");
    if (!descricao?.trim()) return;
    const atualizado = await alterarStatus(pedido.id, "PROBLEMA", descricao.trim(), { ocorrencia: descricao.trim() });
    if (atualizado) setFeedback({ tone: "amber", text: `Ocorrência registrada no ${pedido.codigoPedido}.` });
  }

  async function cancelarPedido(pedido) {
    if (!window.confirm(`Cancelar o pedido logístico ${pedido.codigoPedido}?`)) return;
    const atualizado = await alterarStatus(pedido.id, "CANCELADO", "Pedido logístico cancelado.", { canceladoEm: dataHora() });
    if (atualizado) {
      setFeedback({ tone: "amber", text: `${pedido.codigoPedido} foi cancelado sem gerar custo de entrega.` });
    }
  }

  function PedidoCard({ pedido }) {
    const status = statusConfig[pedido.status] || statusConfig.AGUARDANDO;
    const saldoEntrega = Number(pedido.taxaEntregaCliente || 0) - Number(pedido.custoEstimado || 0);
    const origemCusto = pedido.origemValor === "tabela" ? `tabela ${pedido.tabelaEmpresa || ""}`.trim() : "por km";
    return <div className={cx("rounded-xl border bg-white p-3 dark:bg-slate-800", pedido.status === "PROBLEMA" ? "border-rose-300 dark:border-rose-500/40" : "border-slate-200 dark:border-slate-700")}>
      <div className="flex items-start justify-between gap-2"><div><div className="font-mono text-[10px] text-slate-400">{pedido.codigoPedido}</div><div className="mt-0.5 text-sm font-semibold text-slate-900 dark:text-white">{pedido.clienteNome}</div></div><Badge tone={status.tone}>{status.label}</Badge></div>
      <div className="mt-3 space-y-1.5 text-xs text-slate-500">
        <div className="flex items-start gap-1.5"><MapPin size={13} className="mt-0.5 shrink-0" /><span>{pedido.endereco} · {pedido.bairro}</span></div>
        <div className="flex items-center gap-1.5"><Route size={13} /><span>{Number(pedido.distanciaKm).toLocaleString("pt-BR")} km de ida{pedido.origemValor !== "tabela" && Number(pedido.distanciaCobradaKm || pedido.distanciaKm) !== Number(pedido.distanciaKm) ? ` · ${Number(pedido.distanciaCobradaKm).toLocaleString("pt-BR")} km pagos` : ""} · custo {dinheiro(pedido.custoEstimado)} ({origemCusto})</span></div>
        <div className="flex items-center gap-1.5"><Wallet size={13} /><span>Pedido {dinheiro(pedido.valorPedido)} · taxa cliente {dinheiro(pedido.taxaEntregaCliente)} · saldo <strong className={saldoEntrega >= 0 ? "text-emerald-600" : "text-rose-600"}>{dinheiro(saldoEntrega)}</strong></span></div>
        {pedido.entregador && <div className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300"><Bike size={13} />{pedido.entregador.nome} · {pedido.entregador.empresa}</div>}
        {pedido.ultimaLocalizacao && <a href={`https://www.google.com/maps?q=${pedido.ultimaLocalizacao.latitude},${pedido.ultimaLocalizacao.longitude}`} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 font-medium text-sky-600"><Radio size={13} />GPS recebido às {hora(pedido.ultimaLocalizacao.registradoEm)} <ExternalLink size={11} /></a>}
        <div className="flex items-center gap-1.5 text-slate-400"><Clock3 size={13} />Atualizado às {hora(pedido.atualizadoEm)}</div>
        {pedido.ocorrencia && <div className="rounded-lg bg-rose-50 p-2 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300"><AlertTriangle size={12} className="mr-1 inline" />{pedido.ocorrencia}</div>}
      </div>

      {pedido.status === "EM_PREPARO" && <button type="button" onClick={async () => { const ok = await alterarStatus(pedido.id, "PRONTO", "Pedido pronto para retirada."); if (ok) setFeedback({ tone: "green", text: `${pedido.codigoPedido} está pronto para despacho.` }); }} className={cx(primaryButton, "mt-3 w-full py-2 text-xs")}><PackageCheck size={13} className="mr-1 inline" />Marcar como pronto</button>}
      {["AGUARDANDO", "PRONTO"].includes(pedido.status) && <div className="mt-3 flex gap-2"><select value={atribuicoes[pedido.id] || ""} onChange={evento => setAtribuicoes(atual => ({ ...atual, [pedido.id]: evento.target.value }))} className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-2 py-2 text-xs dark:border-slate-600 dark:bg-slate-800"><option value="">Selecionar entregador</option>{ativos.map(item => <option key={item.id} value={item.id} disabled={ocupados.has(item.id)}>{rotuloEntregador(item, pedido)}{ocupados.has(item.id) ? " · ocupado" : ""}</option>)}</select><button type="button" onClick={() => despachar(pedido)} className="rounded-lg bg-[#7A1420] px-3 py-2 text-xs font-medium text-white">Despachar</button></div>}
      {["COLETA", "NA_LOJA"].includes(pedido.status) && <div className="mt-3 flex gap-2"><button type="button" onClick={() => confirmarColeta(pedido)} className={cx(primaryButton, "flex-1 py-2 text-xs")}><PackageCheck size={13} className="mr-1 inline" />Confirmar saída</button><button type="button" onClick={() => cancelarPedido(pedido)} className="rounded-lg border border-rose-200 px-3 text-xs text-rose-600"><XCircle size={14} /></button></div>}
      {["EM_ROTA", "NO_DESTINO"].includes(pedido.status) && <div className="mt-3 grid grid-cols-2 gap-2"><button type="button" onClick={() => concluirEntrega(pedido)} className={cx(primaryButton, "py-2 text-xs")}><CheckCircle2 size={13} className="mr-1 inline" />Concluir</button><button type="button" onClick={() => registrarProblema(pedido)} className="rounded-lg border border-amber-200 px-3 py-2 text-xs text-amber-700"><AlertTriangle size={13} className="mr-1 inline" />Problema</button></div>}
      {pedido.status === "PROBLEMA" && <button type="button" onClick={async () => { const ok = await alterarStatus(pedido.id, "EM_ROTA", "Entrega retomada após ocorrência.", { ocorrencia: null }); if (ok) setFeedback({ tone: "green", text: `${pedido.codigoPedido} retomou a rota.` }); }} className={cx(primaryButton, "mt-3 w-full py-2 text-xs")}><RefreshCw size={13} className="mr-1 inline" />Retomar entrega</button>}
      {pedido.entregador && !["ENTREGUE", "CANCELADO"].includes(pedido.status) && <button type="button" disabled={gerandoLinksId === pedido.id} onClick={() => abrirLinks(pedido)} className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-lg border border-sky-200 px-3 py-2 text-xs font-medium text-sky-700 disabled:opacity-50"><Link2 size={13} />{gerandoLinksId === pedido.id ? "Gerando..." : "Links e rastreio"}</button>}
    </div>;
  }

  const colunas = [
    { chave: "AGUARDANDO", titulo: "Preparo / despacho", icon: Clock3 },
    { chave: "COLETA", titulo: "Coleta", icon: PackageCheck },
    { chave: "EM_ROTA", titulo: "Em rota", icon: Navigation },
    { chave: "ENTREGUE", titulo: "Finalizados", icon: CheckCircle2 },
  ];

  return <div className="flex flex-col gap-4">
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div><h3 className="text-base font-semibold text-slate-900 dark:text-white">Central de Logística Imperial</h3><p className="text-sm text-slate-500 dark:text-slate-400">Operação própria preparada para receber pedidos do Sischef</p></div>
      <div className="flex flex-wrap gap-2">{api.enabled && <Badge tone="green">Dados protegidos no banco</Badge>}<Badge tone="amber">Sischef aguardando API</Badge><button type="button" onClick={() => setAba("novo")} className={primaryButton}><Plus size={15} className="mr-1 inline" />Novo pedido</button></div>
    </div>

    <div className="flex gap-1 overflow-x-auto border-b border-slate-200 dark:border-slate-700">
      {[["painel", "Painel de despacho"], ["novo", "Entrada manual"], ["integracao", "Preparação Sischef"]].map(([chave, label]) => <button key={chave} onClick={() => setAba(chave)} className={cx("whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-medium", aba === chave ? "border-[#7A1420] text-[#7A1420] dark:text-red-300" : "border-transparent text-slate-400")}>{label}</button>)}
    </div>

    {carregandoDados && <div className="rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-700 dark:border-sky-500/20 dark:bg-sky-500/10 dark:text-sky-300">Sincronizando pedidos, etapas e configurações com o banco de dados...</div>}
    {feedback && <div className={cx("rounded-xl border px-4 py-3 text-sm", feedback.tone === "green" ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300" : feedback.tone === "red" ? "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-300" : "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300")}>{feedback.text}</div>}

    {linksPedido && <Card className="overflow-hidden border-sky-200 dark:border-sky-500/30">
      <div className="flex items-start justify-between gap-3 border-b border-sky-100 bg-sky-50 p-4 dark:border-sky-500/20 dark:bg-sky-500/10">
        <div><div className="flex items-center gap-2 font-semibold text-sky-900 dark:text-sky-200"><Link2 size={17} />Links móveis · {linksPedido.codigoPedido}</div><p className="mt-1 text-xs text-sky-700 dark:text-sky-300">Envie o primeiro ao entregador e o segundo ao cliente.</p></div>
        <button type="button" onClick={() => setLinksPedido(null)} className="text-sky-500"><XCircle size={18} /></button>
      </div>
      <div className="grid gap-3 p-4 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 p-3 dark:border-slate-700"><div className="flex items-center justify-between gap-2"><div><p className="text-[10px] font-semibold uppercase text-slate-400">Entregador · expira em 48h</p><p className="mt-1 text-sm font-medium text-slate-800 dark:text-white">{linksPedido.entregador}</p></div><div className="flex gap-1"><button type="button" onClick={() => copiarLink(linksPedido.entregadorUrl, "Link do entregador")} className="rounded-lg bg-slate-100 p-2 text-slate-600 dark:bg-slate-700 dark:text-slate-200" title="Copiar link"><Copy size={15} /></button><a href={linksPedido.entregadorUrl} target="_blank" rel="noreferrer" className="rounded-lg bg-slate-100 p-2 text-slate-600 dark:bg-slate-700 dark:text-slate-200" title="Abrir painel"><ExternalLink size={15} /></a></div></div><input readOnly value={linksPedido.entregadorUrl} className="mt-3 w-full rounded-lg bg-slate-50 px-3 py-2 font-mono text-[10px] text-slate-500 dark:bg-slate-900/50" /></div>
        <div className="rounded-xl border border-slate-200 p-3 dark:border-slate-700"><div className="flex items-center justify-between gap-2"><div><p className="text-[10px] font-semibold uppercase text-slate-400">Cliente · expira em 7 dias</p><p className="mt-1 text-sm font-medium text-slate-800 dark:text-white">Acompanhamento somente leitura</p></div><div className="flex gap-1"><button type="button" onClick={() => copiarLink(linksPedido.rastreioUrl, "Link de rastreio")} className="rounded-lg bg-slate-100 p-2 text-slate-600 dark:bg-slate-700 dark:text-slate-200" title="Copiar link"><Copy size={15} /></button><a href={linksPedido.rastreioUrl} target="_blank" rel="noreferrer" className="rounded-lg bg-slate-100 p-2 text-slate-600 dark:bg-slate-700 dark:text-slate-200" title="Abrir rastreio"><ExternalLink size={15} /></a></div></div><input readOnly value={linksPedido.rastreioUrl} className="mt-3 w-full rounded-lg bg-slate-50 px-3 py-2 font-mono text-[10px] text-slate-500 dark:bg-slate-900/50" /><button type="button" onClick={compartilharRastreioWhatsapp} className="mt-2 w-full rounded-lg bg-emerald-600 px-3 py-2 text-xs font-medium text-white">Enviar rastreio pelo WhatsApp</button></div>
      </div>
    </Card>}

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
        <label className="text-xs text-slate-500">Bairro *<select value={form.bairro} onChange={selecionarBairro} className={inputClass}><option value="">Selecione o bairro</option>{bairros.map(bairro => <option key={bairro} value={bairro}>{bairro}</option>)}</select></label>
        <label className="text-xs text-slate-500 sm:col-span-2">Endereço completo *<input value={form.endereco} onChange={evento => setForm(atual => ({ ...atual, endereco: evento.target.value }))} onBlur={() => form.bairro && form.endereco.trim() && calcularDistanciaAutomatica(form.bairro, form.endereco)} placeholder="Rua, número, complemento e referência" className={inputClass} /><span className="mt-1 block text-[11px] text-slate-400">Ao sair deste campo, a distância é refinada pelo endereço exato.</span></label>
        <label className="text-xs text-slate-500">Canal<select value={form.canal} onChange={evento => setForm(atual => ({ ...atual, canal: evento.target.value }))} className={inputClass}><option>Direto</option><option>iFood</option><option>Cardápio Web</option><option>WhatsApp</option><option>Sischef</option></select></label>
        <label className="text-xs text-slate-500">Forma de pagamento<select value={form.formaPagamento} onChange={evento => setForm(atual => ({ ...atual, formaPagamento: evento.target.value }))} className={inputClass}><option value="PIX">Pix</option><option value="DINHEIRO">Dinheiro</option><option value="CARTAO">Cartão</option></select></label>
        <label className="text-xs text-slate-500">Valor do pedido<input inputMode="decimal" value={form.valorPedido} onChange={evento => setForm(atual => ({ ...atual, valorPedido: evento.target.value }))} placeholder="0,00" className={inputClass} /></label>
        <label className="text-xs text-slate-500">Taxa cobrada do cliente<input inputMode="decimal" value={form.taxaEntregaCliente} onChange={evento => setForm(atual => ({ ...atual, taxaEntregaCliente: evento.target.value }))} placeholder="0,00" className={inputClass} /></label>
        <label className="text-xs text-slate-500">Distância da loja ao cliente (km) *<div className="mt-1 flex gap-2"><input inputMode="decimal" value={form.distanciaKm} onChange={evento => { setForm(atual => ({ ...atual, distanciaKm: evento.target.value })); setRotaCalculada(null); }} placeholder="Automática" className={inputClass.replace("mt-1 ", "")} /><button type="button" onClick={() => calcularDistanciaAutomatica(form.bairro, form.endereco)} disabled={!form.bairro || calculandoDistancia} className="rounded-xl border border-slate-300 px-3 text-xs font-medium disabled:opacity-40">{calculandoDistancia ? "Calculando..." : "Recalcular"}</button></div>{rotaFeedback && <span className={cx("mt-1.5 block text-[11px]", rotaFeedback.tone === "green" ? "text-emerald-600" : rotaFeedback.tone === "red" ? "text-rose-600" : "text-amber-600")}>{rotaFeedback.text}</span>}</label>
        <div className="rounded-xl bg-slate-50 px-4 py-3 dark:bg-slate-700/30"><div className="text-[10px] uppercase text-slate-400">Custo próprio estimado</div><div className="mt-1 text-lg font-semibold text-[#7A1420] dark:text-red-300">{form.distanciaKm ? dinheiro(custoPara(form.distanciaKm)) : "—"}</div><div className="text-[11px] text-slate-400">{dinheiro(configuracao.valorKm)}/km · mínimo {dinheiro(configuracao.valorMinimo)} · {configuracao.tipoCalculoDistancia === "ida_volta" ? "ida e volta" : "somente ida"}</div></div>
        <div className="rounded-xl border border-slate-200 px-4 py-3 text-xs text-slate-500 dark:border-slate-700 sm:col-span-2"><MapPin size={13} className="mr-1 inline text-[#7A1420] dark:text-red-300" /><strong>Saída:</strong> {configuracao.enderecoOrigem}</div>
        <label className="text-xs text-slate-500 sm:col-span-2">Observações<input value={form.observacoes} onChange={evento => setForm(atual => ({ ...atual, observacoes: evento.target.value }))} className={inputClass} /></label>
        <div className="flex justify-end gap-2 sm:col-span-2"><button type="button" onClick={() => { setForm(formularioInicial); setRotaCalculada(null); setRotaFeedback(null); }} className={secondaryButton}>Limpar</button><button disabled={calculandoDistancia} className={primaryButton}><Plus size={15} className="mr-1 inline" />Colocar na fila</button></div>
      </form></Card>
      <Card className="p-5"><Route size={22} className="text-[#7A1420] dark:text-red-300" /><h3 className="mt-3 font-semibold text-slate-900 dark:text-white">Como funciona agora</h3><ol className="mt-4 space-y-3 text-sm text-slate-500"><li className="flex gap-2"><span className="font-semibold text-[#7A1420]">1.</span>Cadastre o pedido recebido.</li><li className="flex gap-2"><span className="font-semibold text-[#7A1420]">2.</span>Selecione o entregador no painel.</li><li className="flex gap-2"><span className="font-semibold text-[#7A1420]">3.</span>Confirme coleta e saída.</li><li className="flex gap-2"><span className="font-semibold text-[#7A1420]">4.</span>Conclua para registrar o custo.</li></ol></Card>
    </div>}

    {aba === "integracao" && <div className="grid grid-cols-1 gap-4 xl:grid-cols-[360px_1fr]">
      <div className="flex flex-col gap-4">
        <Card className="p-5"><div className="flex items-center gap-2"><Settings2 size={18} className="text-[#7A1420] dark:text-red-300" /><h3 className="font-semibold text-slate-900 dark:text-white">Parâmetros da frota própria</h3></div><p className="mb-4 mt-1 text-xs text-slate-400">A distância parte sempre do endereço da loja</p><form onSubmit={salvarConfiguracao} className="space-y-3"><label className="text-xs text-slate-500">Endereço de saída<input value={configuracao.enderecoOrigem} onChange={evento => setConfiguracao(atual => ({ ...atual, enderecoOrigem: evento.target.value }))} className={inputClass} /></label><label className="text-xs text-slate-500">Quilometragem paga<select value={configuracao.tipoCalculoDistancia} onChange={evento => setConfiguracao(atual => ({ ...atual, tipoCalculoDistancia: evento.target.value }))} className={inputClass}><option value="ida">Somente ida (loja → cliente)</option><option value="ida_volta">Ida e volta (loja → cliente → loja)</option></select></label><label className="text-xs text-slate-500">Valor por quilômetro<input inputMode="decimal" value={configuracao.valorKm} onChange={evento => setConfiguracao(atual => ({ ...atual, valorKm: evento.target.value }))} className={inputClass} /></label><label className="text-xs text-slate-500">Valor mínimo por entrega<input inputMode="decimal" value={configuracao.valorMinimo} onChange={evento => setConfiguracao(atual => ({ ...atual, valorMinimo: evento.target.value }))} className={inputClass} /></label><label className="text-xs text-slate-500">Raio máximo (km)<input inputMode="decimal" value={configuracao.raioMaximoKm} onChange={evento => setConfiguracao(atual => ({ ...atual, raioMaximoKm: evento.target.value }))} className={inputClass} /></label><button className={cx(primaryButton, "w-full")}>Salvar parâmetros</button></form></Card>
        <Card className="p-5"><Navigation size={20} className="text-sky-600" /><h3 className="mt-2 font-semibold text-slate-900 dark:text-white">Rastreamento GPS</h3><p className="mt-2 text-sm text-slate-500">Painel móvel ativo: recebe localização, chegada à loja, saída, chegada ao destino e confirmação da entrega.</p><Badge tone="green">Disponível</Badge></Card>
      </div>
      <Card className="overflow-hidden"><div className="border-b border-slate-100 p-5 dark:border-slate-700"><div className="flex items-center gap-2"><Code2 size={18} className="text-[#7A1420] dark:text-red-300" /><h3 className="font-semibold text-slate-900 dark:text-white">Contrato de entrada do Sischef</h3></div><p className="mt-1 text-xs text-slate-400">Esses campos alimentarão automaticamente a mesma fila usada pela entrada manual</p></div><div className="overflow-x-auto"><table className="w-full min-w-[620px] text-sm"><thead><tr className="border-b border-slate-100 text-left text-xs uppercase text-slate-400 dark:border-slate-700"><th className="px-4 py-3 font-medium">Campo Imperial</th><th className="px-4 py-3 font-medium">Informação esperada</th><th className="px-4 py-3 font-medium">Obrigatório</th></tr></thead><tbody>{contratoPedidoSischef.map(item => <tr key={item.imperial} className="border-b border-slate-50 dark:border-slate-700/50"><td className="px-4 py-3 font-mono text-xs text-[#7A1420] dark:text-red-300">{item.imperial}</td><td className="px-4 py-3 text-slate-600 dark:text-slate-300">{item.descricao}</td><td className="px-4 py-3"><Badge tone={item.obrigatorio ? "amber" : "slate"}>{item.obrigatorio ? "Sim" : "Opcional"}</Badge></td></tr>)}</tbody></table></div><div className="border-t border-slate-100 bg-slate-50 p-4 text-xs text-slate-500 dark:border-slate-700 dark:bg-slate-900/30"><ArrowRight size={13} className="mr-1 inline" />Quando a API for liberada, criaremos um webhook autenticado e idempotente; nenhuma tela operacional precisará ser refeita.</div></Card>
    </div>}
  </div>;
}
