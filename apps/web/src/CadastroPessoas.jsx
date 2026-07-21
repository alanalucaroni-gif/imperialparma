import React, { useEffect, useMemo, useState } from "react";
import { Eye, Pencil, Plus, Search, ShieldCheck, Trash2, Truck, UserCircle2, Users, X } from "lucide-react";
import { api } from "./api";

const input = "mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#7A1420] dark:border-slate-600 dark:bg-slate-800 dark:text-white";
const primary = "inline-flex items-center justify-center gap-2 rounded-xl bg-[#7A1420] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#611018] disabled:opacity-60";
const secondary = "rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200";
const perfis = [["ADMINISTRADOR","Administrador"],["GERENTE","Gerente"],["COZINHA","Cozinha (legado)"],["PRODUCAO","Produção"],["FINANCEIRO","Financeiro"],["COMPRAS","Compras"],["ESTOQUE","Estoque"],["CAIXA","Caixa"],["ATENDENTE","Atendente"],["PERSONALIZADO","Personalizado"]];
const permissoes = [["receitas.visualizar","Visualizar receitas"],["receitas.criar","Criar receitas"],["receitas.editar","Editar receitas"],["receitas.excluir","Excluir receitas"],["financeiro","Financeiro"],["estoque","Estoque"],["compras","Compras (acesso geral)"],["compras.cotacoes.visualizar","Visualizar cotacoes"],["compras.cotacoes.criar","Criar cotacoes"],["compras.cotacoes.enviar","Enviar cotacoes"],["compras.cotacoes.finalizar","Finalizar cotacoes"],["compras.pedidos.gerar","Gerar pedidos"],["compras.pedidos.cancelar","Cancelar pedidos"],["compras.recebimentos.criar","Receber mercadorias"],["compras.estoque.confirmar","Confirmar entrada no estoque"],["compras.valores.visualizar","Visualizar valores"],["compras.economia.visualizar","Visualizar economia"],["cadastros","Cadastros"],["relatorios","Relatórios"]];

const MODULOS = {
  funcionarios: {
    titulo: "Funcionários", descricao: "Colaboradores da empresa, com ou sem acesso ao sistema.", icone: UserCircle2, list: "getFuncionarios", get: "getFuncionario", create: "cadastrarFuncionario", update: "atualizarFuncionario", remove: "desativarFuncionario",
    filtros: [["setor","Setor"],["cargo","Cargo"]], ordenar: ["nome","codigo","setor","cargo","dataAdmissao"],
    colunas: [["codigo","Código"],["nome","Funcionário"],["setor","Setor"],["cargo","Cargo"],["ativo","Status"]],
    vazio: { nome:"", cpf:"", rg:"", dataNascimento:"", dataAdmissao:"", cargo:"", setor:"", telefone:"", email:"", endereco:"", salario:"", ativo:true, observacoes:"", fotoUrl:"" },
    campos: [["nome","Nome completo","text",true],["cpf","CPF","text"],["rg","RG","text"],["dataNascimento","Data de nascimento","date"],["dataAdmissao","Data de admissão","date"],["cargo","Cargo","text",true],["setor","Setor","text",true],["telefone","Telefone","text"],["email","E-mail","email"],["endereco","Endereço","text"],["salario","Salário","number"],["fotoUrl","Foto (URL opcional)","url"],["observacoes","Observações","textarea"],["ativo","Funcionário ativo","checkbox"]],
  },
  usuarios: {
    titulo: "Usuários", descricao: "Acessos, perfis e permissões por módulo.", icone: ShieldCheck, list: "getUsuarios", create: "cadastrarUsuario", update: "atualizarUsuario", remove: "desativarUsuario",
    filtros: [["perfil","Perfil"]], ordenar: ["nome","login","role","criadoEm","ultimoAcesso"],
    colunas: [["nome","Usuário"],["role","Perfil"],["funcionario","Funcionário"],["ultimoAcesso","Último acesso"],["ativo","Status"]],
    vazio: { nome:"", login:"", email:"", senha:"", funcionarioId:"", role:"ESTOQUE", permissoes:[], ativo:true },
    campos: [["nome","Nome","text",true],["login","Login","text",true],["email","E-mail","email",true],["senha","Senha inicial","password",true],["funcionarioId","Funcionário vinculado","funcionario"],["role","Perfil de acesso","perfil"],["permissoes","Permissões por módulo","permissoes"],["ativo","Acesso ativo","checkbox"]],
  },
  fornecedores: {
    titulo: "Fornecedores", descricao: "Parceiros de compras, estoque e entrada de mercadorias.", icone: Truck, list: "getFornecedores", get: "getFornecedor", create: "cadastrarFornecedor", update: "atualizarFornecedor", remove: "desativarFornecedor",
    filtros: [["categoria","Categoria"],["estado","UF"]], ordenar: ["nome","razaoSocial","cidade","categoria","criadoEm"],
    colunas: [["nome","Fornecedor"],["cnpj","CNPJ"],["categoria","Categoria"],["cidade","Cidade"],["contato","Contato"],["ativo","Status"]],
    vazio: { razaoSocial:"", nomeFantasia:"", cnpj:"", inscricaoEstadual:"", telefone:"", whatsapp:"", email:"", site:"", endereco:"", cidade:"", estado:"", cep:"", contatoPrincipal:"", categoria:"", formaPagamento:"", prazoPagamento:"", avaliacao:"", ativo:true, observacao:"" },
    campos: [["razaoSocial","Razão Social","text",true],["nomeFantasia","Nome Fantasia","text"],["cnpj","CNPJ","text"],["inscricaoEstadual","Inscrição Estadual","text"],["telefone","Telefone","text"],["whatsapp","WhatsApp","text"],["email","E-mail","email"],["site","Site","url"],["endereco","Endereço completo","text"],["cidade","Cidade","text"],["estado","Estado","text"],["cep","CEP","text"],["contatoPrincipal","Contato principal","text"],["categoria","Categoria","text"],["formaPagamento","Forma de pagamento","text"],["prazoPagamento","Prazo de pagamento (dias)","number"],["avaliacao","Avaliacao (0 a 5)","number"],["observacao","Observações","textarea"],["ativo","Fornecedor ativo","checkbox"]],
  },
};

function erro(e) { return e?.message || "Não foi possível concluir a operação."; }
function data(valor, hora = false) { return valor ? new Date(valor).toLocaleString("pt-BR", hora ? { dateStyle:"short", timeStyle:"short" } : { dateStyle:"short" }) : "—"; }
function dataInput(valor) { return valor ? String(valor).slice(0,10) : ""; }
function normalizaRegistro(registro, modulo) {
  const base = { ...MODULOS[modulo].vazio, ...registro };
  Object.keys(base).forEach(chave => { if (chave.startsWith("data")) base[chave] = dataInput(base[chave]); });
  if (modulo === "usuarios") { base.funcionarioId = registro.funcionario?.id || ""; base.permissoes = registro.permissoes || []; base.senha = ""; }
  return base;
}
function Status({ ativo }) { return <span className={"rounded-full px-2 py-0.5 text-[11px] font-semibold " + (ativo ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300" : "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300")}>{ativo ? "Ativo" : "Inativo"}</span>; }
function Modal({ titulo, onClose, children }) { return <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4"><section className="max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl dark:bg-slate-800"><div className="mb-5 flex items-center justify-between"><h3 className="text-lg font-semibold text-slate-900 dark:text-white">{titulo}</h3><button onClick={onClose} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"><X size={19} /></button></div>{children}</section></div>; }
function Valor({ campo, registro }) {
  if (campo === "ativo") return <Status ativo={registro.ativo} />;
  if (campo === "funcionario") return registro.funcionario?.nome || "—";
  if (campo === "nome" && registro.nomeFantasia) return <><div className="font-medium">{registro.nomeFantasia}</div><div className="text-xs text-slate-400">{registro.razaoSocial}</div></>;
  if (campo === "contato") return registro.whatsapp || registro.telefone || registro.email || "—";
  if (campo === "ultimoAcesso") return data(registro.ultimoAcesso, true);
  return registro[campo] || "—";
}
function Campo({ definicao, valor, setValor, funcionarios, editando }) {
  const [chave, texto, tipo, obrigatorio] = definicao;
  if (tipo === "checkbox") return <label className="mt-5 flex items-center gap-2 text-sm text-slate-600 dark:text-slate-200"><input type="checkbox" checked={Boolean(valor)} onChange={e => setValor(e.target.checked)} className="accent-[#7A1420]" />{texto}</label>;
  if (tipo === "textarea") return <label className="col-span-full block text-xs font-medium text-slate-500">{texto}<textarea value={valor || ""} onChange={e => setValor(e.target.value)} className={input + " min-h-24"} /></label>;
  if (tipo === "perfil") return <label className="block text-xs font-medium text-slate-500">{texto}<select value={valor} onChange={e => setValor(e.target.value)} className={input}>{perfis.map(([v,r]) => <option key={v} value={v}>{r}</option>)}</select></label>;
  if (tipo === "funcionario") return <label className="block text-xs font-medium text-slate-500">{texto}<select value={valor || ""} onChange={e => setValor(e.target.value)} className={input}><option value="">Sem vínculo</option>{funcionarios.map(f => <option key={f.id} value={f.id}>#{f.codigo} · {f.nome} ({f.setor})</option>)}</select></label>;
  if (tipo === "permissoes") return <fieldset className="col-span-full rounded-xl border border-slate-200 p-4 dark:border-slate-700"><legend className="px-1 text-sm font-semibold text-slate-800 dark:text-white">{texto}</legend><div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{permissoes.map(([v,r]) => <label key={v} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-200"><input type="checkbox" checked={(valor || []).includes(v)} onChange={() => setValor((valor || []).includes(v) ? valor.filter(x => x !== v) : [...(valor || []), v])} className="accent-[#7A1420]" />{r}</label>)}</div></fieldset>;
  return <label className="block text-xs font-medium text-slate-500">{editando && chave === "senha" ? "Nova senha (opcional)" : texto}{tipo === "password" ? <input type="password" required={obrigatorio && !editando} minLength="8" value={valor || ""} onChange={e => setValor(e.target.value)} className={input} autoComplete="new-password" /> : <input type={tipo} required={obrigatorio} value={valor || ""} onChange={e => setValor(e.target.value)} className={input} />}</label>;
}function Modulo({ nome, funcionarios, podeGerenciarUsuarios }) {
  const config = MODULOS[nome];
  const [filtros, setFiltros] = useState({ busca:"", status:nome === "usuarios" ? "todos" : "ativo", page:1, limit:10, ordenarPor:config.ordenar[0], direcao:"asc" });
  const [resultado, setResultado] = useState({ data:[], meta:null });
  const [registro, setRegistro] = useState(null);
  const [formulario, setFormulario] = useState(config.vazio);
  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState("");

  useEffect(() => {
    if (nome === "usuarios" && !podeGerenciarUsuarios) return;
    let ativo = true;
    api[config.list](filtros).then(valor => { if (ativo) setResultado(valor); }).catch(e => { if (ativo) setMensagem(erro(e)); });
    return () => { ativo = false; };
  }, [config.list, filtros, nome, podeGerenciarUsuarios]);

  if (nome === "usuarios" && !podeGerenciarUsuarios) return <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-100"><h2 className="font-semibold">Acesso restrito</h2><p className="mt-1 text-sm">Somente administradores podem gerir usuários e permissões.</p></div>;

  const mudarFiltro = (chave, valor) => setFiltros(atual => ({ ...atual, [chave]:valor, page:1 }));
  const abrirNovo = () => { setFormulario(config.vazio); setRegistro({ modo:"form" }); setMensagem(""); };
  const editar = item => { setFormulario(normalizaRegistro(item,nome)); setRegistro({ modo:"form" }); setMensagem(""); };
  const ver = async item => {
    try { const valor = config.get ? await api[config.get](item.id) : item; setRegistro({ modo:"view", valor }); }
    catch (e) { setMensagem(erro(e)); }
  };
  const excluir = async item => {
    if (!window.confirm("Desativar " + item.nome + "?")) return;
    try { await api[config.remove](item.id); setFiltros(atual => ({ ...atual })); }
    catch (e) { setMensagem(erro(e)); }
  };
  const salvar = async event => {
    event.preventDefault(); setSalvando(true); setMensagem("");
    try {
      const corpo = { ...formulario };
      if (nome === "funcionarios") corpo.salario = corpo.salario === "" ? undefined : Number(String(corpo.salario).replace(",","."));
      if (nome === "fornecedores") corpo.prazoPagamento = corpo.prazoPagamento === "" ? undefined : Number(corpo.prazoPagamento);
      if (nome === "usuarios") corpo.funcionarioId = corpo.funcionarioId || undefined;
      if (corpo.id) {
        await api[config.update](corpo.id, corpo);
        if (nome === "usuarios" && corpo.senha) await api.redefinirSenhaUsuario(corpo.id, corpo.senha);
      } else await api[config.create](corpo);
      setRegistro(null); setFiltros(atual => ({ ...atual }));
    } catch (e) { setMensagem(erro(e)); } finally { setSalvando(false); }
  };
  const ordenar = chave => setFiltros(atual => ({ ...atual, ordenarPor:chave, direcao: atual.ordenarPor === chave && atual.direcao === "asc" ? "desc" : "asc", page:1 }));
  const icon = config.icone;

  return <div className="space-y-5">
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div className="flex gap-2"><div className="mt-0.5 text-[#7A1420] dark:text-red-300">{React.createElement(icon,{size:20})}</div><div><h2 className="text-lg font-semibold text-slate-900 dark:text-white">{config.titulo}</h2><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{config.descricao}</p></div></div><button onClick={abrirNovo} className={primary}><Plus size={16} /> Novo</button></div>
    {mensagem && <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-100">{mensagem}</p>}
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800/60">
      <div className="flex flex-col gap-3 border-b border-slate-100 p-4 lg:flex-row dark:border-slate-700"><div className="relative min-w-0 flex-1"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input value={filtros.busca} onChange={e => mudarFiltro("busca",e.target.value)} placeholder="Pesquisa rápida..." className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-[#7A1420] dark:border-slate-600 dark:bg-slate-800" /></div><div className="flex flex-wrap gap-2">{config.filtros.map(([chave,texto]) => chave === "perfil" ? <select key={chave} value={filtros[chave] || ""} onChange={e => mudarFiltro(chave,e.target.value)} className={secondary}><option value="">Todos os perfis</option>{perfis.map(([v,r]) => <option key={v} value={v}>{r}</option>)}</select> : <input key={chave} value={filtros[chave] || ""} onChange={e => mudarFiltro(chave,e.target.value)} className={secondary + " max-w-36"} placeholder={texto} />)}<select value={filtros.status} onChange={e => mudarFiltro("status",e.target.value)} className={secondary}><option value="ativo">Ativos</option><option value="inativo">Inativos</option><option value="todos">Todos</option></select></div></div>
      <div className="overflow-x-auto"><table className="w-full min-w-[860px] text-sm"><thead className="border-b border-slate-100 text-left text-xs uppercase text-slate-400 dark:border-slate-700"><tr>{config.colunas.map(([chave,texto]) => <th key={chave} className="px-4 py-3"><button onClick={() => config.ordenar.includes(chave) && ordenar(chave)} className="font-medium hover:text-[#7A1420]">{texto}{filtros.ordenarPor === chave ? (filtros.direcao === "asc" ? " ↑" : " ↓") : ""}</button></th>)}<th className="px-4 py-3" /></tr></thead><tbody>{resultado.data.map(item => <tr key={item.id} className="border-b border-slate-50 dark:border-slate-700/60">{config.colunas.map(([chave]) => <td key={chave} className="px-4 py-3 text-slate-600 dark:text-slate-300"><Valor campo={chave} registro={item} /></td>)}<td className="px-4 py-3"><div className="flex justify-end gap-1"><button onClick={() => ver(item)} className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-[#7A1420] dark:hover:bg-slate-700"><Eye size={16} /></button><button onClick={() => editar(item)} className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-[#7A1420] dark:hover:bg-slate-700"><Pencil size={16} /></button>{item.ativo && <button onClick={() => excluir(item)} className="rounded-lg p-1.5 text-slate-500 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/10"><Trash2 size={16} /></button>}</div></td></tr>)}</tbody></table></div>
      {!resultado.data.length && <p className="p-10 text-center text-sm text-slate-400">Nenhum registro encontrado.</p>}
      {resultado.meta && <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3 text-xs text-slate-500 dark:border-slate-700"><span>{resultado.meta.total} registro(s) · página {resultado.meta.page} de {resultado.meta.pages}</span><div className="flex gap-2"><button disabled={resultado.meta.page <= 1} onClick={() => mudarFiltro("page",resultado.meta.page - 1)} className={secondary + " disabled:opacity-40"}>Anterior</button><button disabled={resultado.meta.page >= resultado.meta.pages} onClick={() => mudarFiltro("page",resultado.meta.page + 1)} className={secondary + " disabled:opacity-40"}>Próxima</button></div></div>}
    </section>
    {registro?.modo === "form" && <Modal titulo={formulario.id ? "Editar " + config.titulo.slice(0,-1).toLowerCase() : "Novo cadastro"} onClose={() => setRegistro(null)}><form onSubmit={salvar} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{config.campos.map(def => <Campo key={def[0]} definicao={def} valor={formulario[def[0]]} setValor={valor => setFormulario(atual => ({ ...atual, [def[0]]:valor }))} funcionarios={funcionarios} editando={Boolean(formulario.id)} />)}<div className="col-span-full flex justify-end pt-3"><button disabled={salvando} className={primary}>{salvando ? "Salvando..." : "Salvar"}</button></div></form></Modal>}
    {registro?.modo === "view" && <Modal titulo={config.titulo.slice(0,-1) + ": " + (registro.valor.nomeFantasia || registro.valor.nome)} onClose={() => setRegistro(null)}><div className="grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-3">{config.campos.filter(([chave,,tipo]) => tipo !== "password" && tipo !== "checkbox" && tipo !== "permissoes").map(([chave,texto]) => <div key={chave}><div className="text-xs font-medium uppercase tracking-wide text-slate-400">{texto}</div><div className="mt-1 text-slate-700 dark:text-slate-200">{chave.startsWith("data") ? data(registro.valor[chave]) : registro.valor[chave] || "—"}</div></div>)}</div></Modal>}
  </div>;
}

export default function CadastroPessoas() {
  const [aba, setAba] = useState("funcionarios");
  const [funcionarios, setFuncionarios] = useState([]);
  const usuario = api.usuario;
  useEffect(() => { if (api.enabled) api.getFuncionariosAtivos().then(setFuncionarios).catch(() => setFuncionarios([])); }, []);
  const abas = [["funcionarios","Funcionários",UserCircle2],["usuarios","Usuários",ShieldCheck],["fornecedores","Fornecedores",Truck]];
  return <div className="flex flex-col gap-5"><div className="overflow-x-auto border-b border-slate-200 dark:border-slate-700"><div className="flex min-w-max gap-1">{abas.map(([chave,texto,Icon]) => <button key={chave} onClick={() => setAba(chave)} className={"inline-flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium " + (aba === chave ? "border-[#7A1420] text-[#7A1420] dark:text-red-300" : "border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400")}><Icon size={16} />{texto}</button>)}</div></div><Modulo nome={aba} funcionarios={funcionarios} podeGerenciarUsuarios={usuario?.role === "ADMINISTRADOR"} /></div>;
}