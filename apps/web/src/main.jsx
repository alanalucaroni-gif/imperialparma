import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import ImperialERP from "./ImperialERP.jsx";
import { api } from "./api";
import "./styles.css";

function LoginScreen({ onLogin }) {
  const [email, setEmail] = useState("admin@imperial.local");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  async function entrar(event) {
    event.preventDefault();
    setErro("");
    setEnviando(true);
    try {
      await api.login(email.trim(), senha);
      onLogin();
    } catch (error) {
      setErro(error?.message || "Nao foi possivel entrar.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#2B0005] px-4 py-10 flex items-center justify-center">
      <section className="w-full max-w-md rounded-3xl bg-white p-7 sm:p-9 shadow-2xl">
        <div className="mb-7">
          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7A1420]">Imperial ERP</div>
          <h1 className="mt-2 text-2xl font-bold text-slate-900">Acessar o sistema</h1>
          <p className="mt-1 text-sm text-slate-500">Entre com seu e-mail e sua senha.</p>
        </div>
        <form onSubmit={entrar} className="space-y-4">
          <label className="block text-sm font-medium text-slate-700">
            E-mail ou login
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="username"
              required
              className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-3 outline-none focus:border-[#7A1420] focus:ring-2 focus:ring-red-100"
            />
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Senha
            <input
              type="password"
              value={senha}
              onChange={(event) => setSenha(event.target.value)}
              autoComplete="current-password"
              required
              className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-3 outline-none focus:border-[#7A1420] focus:ring-2 focus:ring-red-100"
            />
          </label>
          {erro && <p className="rounded-xl bg-red-50 px-3 py-2.5 text-sm text-red-700">{erro}</p>}
          <button
            type="submit"
            disabled={enviando}
            className="w-full rounded-xl bg-[#7A1420] px-4 py-3 font-semibold text-white transition hover:bg-[#5f0f18] disabled:cursor-wait disabled:opacity-60"
          >
            {enviando ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </section>
    </main>
  );
}

function AuthGate() {
  const [status, setStatus] = useState(api.enabled ? "checking" : "authenticated");

  useEffect(() => {
    if (!api.enabled) return;
    api.ensureSession().then((ok) => setStatus(ok ? "authenticated" : "anonymous"));
  }, []);

  if (status === "checking") {
    return <div className="min-h-screen bg-[#2B0005] text-white flex items-center justify-center">Carregando o Imperial ERP...</div>;
  }
  if (status === "anonymous") {
    return <LoginScreen onLogin={() => setStatus("authenticated")} />;
  }
  return (
    <>
      <ImperialERP />
      {api.enabled && (
        <button
          onClick={() => {
            api.logout();
            setStatus("anonymous");
          }}
          className="fixed bottom-4 right-4 z-50 rounded-xl border border-slate-200 bg-white/95 px-3 py-2 text-xs font-semibold text-slate-600 shadow-lg hover:text-[#7A1420]"
        >
          Sair
        </button>
      )}
    </>
  );
}

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthGate />
  </React.StrictMode>,
);
