import React, { useEffect, useState } from "react";
import { Plus, ShieldCheck, UserCog, Users } from "lucide-react";
import { api } from "./api";

const PERFIS = [
  ["ADMINISTRADOR", "Administrador"],
  ["GERENTE", "Gerente"],
  ["COZINHA", "Cozinha"],
  ["COMPRAS", "Compras"],
  ["FINANCEIRO", "Financeiro"],
  ["ESTOQUE", "Estoque"],
];

const FORMULARIO_INICIAL = { id: "", nome: "", email: "", role: "ESTOQUE", senha: "", ativo: true };
const rotuloPerfil = (role) => PERFIS.find(([valor]) => valor === role)?.[1] || role;

function mensagemErro(error) {
  return error?.message || "Não foi possível concluir a operação.";
}

export default function Usuarios() {
  const usuarioLogado = api.usuario;
  const podeGerenciar = usuarioLogado?.role === "ADMINISTRADOR";
  const [usuarios, setUsuarios] = useState([]);
  const [formulario, setFormulario] = useState(FORMULARIO_INICIAL);
  const [carregando, setCarregando] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [feedback, setFeedback] = useState(null);

  async function carregar() {
    setCarregando(true);
    try {
      setUsuarios(await api.getUsuarios());
    } catch (error) {
      setFeedback({ tipo: "erro", texto: mensagemErro(error) });
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    if (api.enabled && podeGerenciar) carregar();
  }, [podeGerenciar]);

  function editar(usuario) {
    setFormulario({
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      role: usuario.role,
      senha: "",
      ativo: usuario.ativo,
    });
    setFeedback(null);
  }

  function novoUsuario() {
    setFormulario(FORMULARIO_INICIAL);
    setFeedback(null);
  }

  async function salvar(event) {
    event.preventDefault();
    const editando = Boolean(formulario.id);
    if (!editando && formulario.senha.length < 8) {
      setFeedback({ tipo: "erro", texto: "Defina uma senha com pelo menos 8 caracteres." });
      return;
    }
    if (editando && formulario.senha && formulario.senha.length < 8) {
      setFeedback({ tipo: "erro", texto: "A nova senha deve ter pelo menos 8 caracteres." });
      return;
    }

    setSalvando(true);
    setFeedback(null);
    try {
      const dados = {
        nome: formulario.nome.trim(),
        email: formulario.email.trim(),
        role: formulario.role,
        ativo: formulario.ativo,
      };
      if (editando) {
        await api.atualizarUsuario(formulario.id, dados);
        if (formulario.senha) await api.redefinirSenhaUsuario(formulario.id, formulario.senha);
        setFeedback({ tipo: "sucesso", texto: formulario.senha ? "Usuário e senha atualizados." : "Usuário atualizado." });
      } else {
        await api.cadastrarUsuario({ ...dados, senha: formulario.senha });
        setFeedback({ tipo: "sucesso", texto: "Usuário cadastrado com sucesso." });
      }
      novoUsuario();
      await carregar();
    } catch (error) {
      setFeedback({ tipo: "erro", texto: mensagemErro(error) });
    } finally {
      setSalvando(false);
    }
  }

  async function desativar(usuario) {
    if (!window.confirm(`Desativar o acesso de ${usuario.nome}?`)) return;
    try {
      await api.desativarUsuario(usuario.id);
      setFeedback({ tipo: "sucesso", texto: "Usuário desativado e sessões encerradas." });
      if (formulario.id === usuario.id) novoUsuario();
      await carregar();
    } catch (error) {
      setFeedback({ tipo: "erro", texto: mensagemErro(error) });
    }
  }

  if (!api.enabled) {
    return <section className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200"><h2 className="text-lg font-semibold">Usuários e acessos</h2><p className="mt-2 text-sm">Configure <code>VITE_API_URL</code> para conectar o cadastro de usuários ao servidor.</p></section>;
  }

  if (!podeGerenciar) {
    return <section className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-800 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200"><h2 className="text-lg font-semibold">Acesso restrito</h2><p className="mt-2 text-sm">Apenas administradores podem gerenciar usuários e perfis de acesso.</p></section>;
  }

  const ativos = usuarios.filter((usuario) => usuario.ativo).length;
  const administradores = usuarios.filter((usuario) => usuario.ativo && usuario.role === "ADMINISTRADOR").length;
  const editando = Boolean(formulario.id);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div><h2 className="text-lg font-semibold text-slate-900 dark:text-white">Usuários e acessos</h2><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Cadastre a equipe, atribua perfis e bloqueie acessos quando necessário.</p></div>
        <button type="button" onClick={novoUsuario} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#7A1420] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#611018]"><Plus size={16} /> Novo usuário</button>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700/60 dark:bg-slate-800/60"><div className="flex items-center justify-between text-sm text-slate-500"><span>Usuários ativos</span><Users size={16} /></div><div className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">{ativos}</div></div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700/60 dark:bg-slate-800/60"><div className="flex items-center justify-between text-sm text-slate-500"><span>Administradores</span><ShieldCheck size={16} /></div><div className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">{administradores}</div></div>
        <div className="col-span-2 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700/60 dark:bg-slate-800/60 lg:col-span-1"><div className="flex items-center gap-2 text-sm text-slate-500"><UserCog size={16} /><span>Seu perfil</span></div><div className="mt-2 font-semibold text-slate-900 dark:text-white">{rotuloPerfil(usuarioLogado.role)}</div></div>
      </div>

      {feedback && <div className={`rounded-xl border px-4 py-3 text-sm ${feedback.tipo === "erro" ? "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200" : "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200"}`}>{feedback.texto}</div>}

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[360px_1fr]">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] dark:border-slate-700/60 dark:bg-slate-800/60">
          <h3 className="font-semibold text-slate-900 dark:text-white">{editando ? "Editar usuário" : "Novo usuário"}</h3>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{editando ? "Deixe a senha em branco para mantê-la." : "A senha inicial deve ter ao menos 8 caracteres."}</p>
          <form onSubmit={salvar} className="mt-5 flex flex-col gap-3">
            <label className="text-xs text-slate-500">Nome<input required value={formulario.nome} onChange={(event) => setFormulario((atual) => ({ ...atual, nome: event.target.value }))} className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#7A1420] dark:border-slate-600 dark:bg-slate-800" /></label>
            <label className="text-xs text-slate-500">E-mail<input required type="email" value={formulario.email} onChange={(event) => setFormulario((atual) => ({ ...atual, email: event.target.value }))} className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#7A1420] dark:border-slate-600 dark:bg-slate-800" /></label>
            <label className="text-xs text-slate-500">Perfil<select value={formulario.role} onChange={(event) => setFormulario((atual) => ({ ...atual, role: event.target.value }))} disabled={formulario.id === usuarioLogado.id} className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#7A1420] disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-600 dark:bg-slate-800">{PERFIS.map(([valor, rotulo]) => <option key={valor} value={valor}>{rotulo}</option>)}</select></label>
            <label className="text-xs text-slate-500">{editando ? "Nova senha (opcional)" : "Senha inicial"}<input required={!editando} minLength="8" type="password" autoComplete="new-password" value={formulario.senha} onChange={(event) => setFormulario((atual) => ({ ...atual, senha: event.target.value }))} className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#7A1420] dark:border-slate-600 dark:bg-slate-800" /></label>
            <label className="flex items-center gap-2 pt-1 text-sm text-slate-600 dark:text-slate-300"><input type="checkbox" checked={formulario.ativo} disabled={formulario.id === usuarioLogado.id} onChange={(event) => setFormulario((atual) => ({ ...atual, ativo: event.target.checked }))} className="accent-[#7A1420]" />Acesso ativo</label>
            <div className="mt-2 grid grid-cols-2 gap-2"><button type="button" onClick={novoUsuario} className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm dark:border-slate-600">Cancelar</button><button disabled={salvando} className="rounded-xl bg-[#7A1420] px-3 py-2.5 text-sm font-medium text-white hover:bg-[#611018] disabled:opacity-60">{salvando ? "Salvando..." : editando ? "Salvar" : "Cadastrar"}</button></div>
          </form>
        </section>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)] dark:border-slate-700/60 dark:bg-slate-800/60">
          <div className="border-b border-slate-100 p-4 dark:border-slate-700"><h3 className="font-semibold text-slate-900 dark:text-white">Equipe cadastrada</h3><p className="mt-0.5 text-xs text-slate-400">{usuarios.length} usuário(s) no sistema</p></div>
          {carregando ? <div className="p-8 text-center text-sm text-slate-400">Carregando usuários...</div> : <div className="overflow-x-auto"><table className="w-full min-w-[660px] text-sm"><thead><tr className="border-b border-slate-100 text-left text-xs uppercase text-slate-400 dark:border-slate-700"><th className="px-4 py-2.5 font-medium">Usuário</th><th className="px-4 py-2.5 font-medium">Perfil</th><th className="px-4 py-2.5 font-medium">Status</th><th className="px-4 py-2.5 font-medium">Cadastro</th><th className="px-4 py-2.5"></th></tr></thead><tbody>{usuarios.map((usuario) => <tr key={usuario.id} className="border-b border-slate-50 dark:border-slate-700/50"><td className="px-4 py-3"><div className="font-medium text-slate-800 dark:text-slate-200">{usuario.nome}{usuario.id === usuarioLogado.id && <span className="ml-2 text-xs font-normal text-slate-400">(você)</span>}</div><div className="text-xs text-slate-400">{usuario.email}</div></td><td className="px-4 py-3"><span className="rounded-full bg-red-50 px-2 py-0.5 text-[11px] font-medium text-red-800 dark:bg-red-500/10 dark:text-red-300">{rotuloPerfil(usuario.role)}</span></td><td className="px-4 py-3"><span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${usuario.ativo ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300" : "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300"}`}>{usuario.ativo ? "Ativo" : "Inativo"}</span></td><td className="px-4 py-3 text-xs text-slate-500">{new Date(usuario.criadoEm).toLocaleDateString("pt-BR")}</td><td className="px-4 py-3 text-right"><button type="button" onClick={() => editar(usuario)} className="mr-3 text-xs font-medium text-[#7A1420] hover:underline dark:text-red-300">Editar</button>{usuario.ativo && usuario.id !== usuarioLogado.id && <button type="button" onClick={() => desativar(usuario)} className="text-xs font-medium text-rose-600 hover:underline">Desativar</button>}</td></tr>)}</tbody></table>{usuarios.length === 0 && <div className="p-8 text-center text-sm text-slate-400">Nenhum usuário cadastrado.</div>}</div>}
        </section>
      </div>
    </div>
  );
}
