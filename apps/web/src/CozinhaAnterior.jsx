import React, { useMemo } from "react";
import { CheckCircle2, Loader2, PauseCircle, RefreshCw, Trash2 } from "lucide-react";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const numero = valor => Number(valor || 0);
const dataHora = valor => valor
  ? new Date(valor).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })
  : "—";

function Card({ children, className = "" }) {
  return (
    <section className={`rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800/60 ${className}`}>
      {children}
    </section>
  );
}

function OrdemCard({
  ordem,
  tipo,
  editar,
  cancelar,
  pausar,
  iniciar,
  concluir,
  estornar,
  processarEstoque,
}) {
  const estoqueOk = Boolean(ordem.estoqueProcessadoEm);
  const codigo = `PR-${String(ordem.id || "").slice(-5).toUpperCase()}`;
  const horario = ordem.horaInicio
    ? new Date(ordem.horaInicio).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
    : null;

  return (
    <Card className="p-4">
      <div className="mb-2 flex items-center justify-between">
        <span className="font-mono text-xs text-slate-400">{codigo}</span>
        {tipo === "preparo" && <Loader2 size={14} className="animate-spin text-[#7A1420]" />}
        {tipo === "concluida" && <CheckCircle2 size={15} className={estoqueOk ? "text-emerald-500" : "text-amber-500"} />}
        {tipo === "aguardando" && <PauseCircle size={15} className="text-slate-400" />}
      </div>

      <h4 className="font-semibold text-slate-900 dark:text-white">{ordem.receita?.nome || "Receita"}</h4>
      <p className="mt-1 text-xs text-slate-500">
        {numero(ordem.quantidadeProduzida).toLocaleString("pt-BR")} {ordem.unidade}
        {" · "}
        {ordem.funcionario?.nome || "Sem responsável"}
      </p>
      <p className="mt-1 text-[11px] text-slate-400">
        {ordem.lote ? `Lote ${ordem.lote} · ` : ""}
        {horario ? `início ${horario}` : ordem.setor || ordem.funcionario?.setor || "Cozinha"}
      </p>

      {tipo === "preparo" && (
        <div className="mt-3">
          <div className="h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700">
            <div className="h-full w-2/3 rounded-full bg-[#7A1420]" />
          </div>
          <p className="mt-1 text-[11px] text-slate-400">Produção em andamento</p>
        </div>
      )}

      <div className="mt-3 flex flex-wrap gap-2">
        <button onClick={() => editar(ordem)} className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-600 dark:border-slate-600 dark:text-slate-200">
          Detalhes
        </button>
        {tipo === "aguardando" && (
          <button onClick={() => iniciar(ordem)} className="flex-1 rounded-lg bg-[#7A1420] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#611018]">
            Iniciar produção
          </button>
        )}
        {tipo === "preparo" && (
          <>
            <button onClick={() => pausar(ordem)} className="rounded-lg border border-sky-200 px-3 py-1.5 text-xs text-sky-700">
              Pausar
            </button>
            <button onClick={() => concluir(ordem)} className="flex-1 rounded-lg bg-[#7A1420] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#611018]">
              Concluir e movimentar estoque
            </button>
          </>
        )}
        {tipo !== "concluida" && (
          <button onClick={() => cancelar(ordem)} className="rounded-lg border border-rose-200 px-3 py-1.5 text-xs text-rose-600">
            Cancelar
          </button>
        )}
      </div>

      {tipo === "concluida" && (
        <div className="mt-3 space-y-2">
          {estoqueOk ? (
            <p className="text-[11px] font-medium text-emerald-600">
              Estoque movimentado · {dataHora(ordem.estoqueProcessadoEm)}
            </p>
          ) : (
            <p className="text-[11px] font-semibold text-amber-700">Estoque pendente de processamento</p>
          )}
          <div className="flex flex-wrap gap-2">
            {!estoqueOk && (
              <button onClick={() => processarEstoque(ordem)} className="inline-flex flex-1 items-center justify-center gap-1 rounded-lg border border-amber-200 px-3 py-1.5 text-xs font-medium text-amber-700">
                <RefreshCw size={14} />
                Processar estoque
              </button>
            )}
            <button onClick={() => estornar(ordem)} className="inline-flex flex-1 items-center justify-center gap-1 rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-medium text-rose-600">
              <Trash2 size={14} />
              {estoqueOk ? "Excluir e estornar" : "Excluir ordem"}
            </button>
          </div>
        </div>
      )}
    </Card>
  );
}

export default function CozinhaAnterior({
  producoes,
  editar,
  cancelar,
  pausar,
  iniciar,
  concluir,
  estornar,
  processarEstoque,
}) {
  const hoje = new Date().toLocaleDateString("pt-BR");
  const grafico = useMemo(() => {
    const inicio = new Date();
    inicio.setHours(0, 0, 0, 0);
    inicio.setDate(inicio.getDate() - ((inicio.getDay() + 6) % 7));

    return Array.from({ length: 6 }, (_, indice) => {
      const data = new Date(inicio);
      data.setDate(inicio.getDate() + indice);
      const chave = data.toLocaleDateString("pt-BR");
      const quantidade = producoes
        .filter(item => item.status !== "CANCELADA" && new Date(item.dataProducao).toLocaleDateString("pt-BR") === chave)
        .reduce((total, item) => total + numero(item.quantidadeProduzida), 0);
      return {
        dia: data.toLocaleDateString("pt-BR", { weekday: "short" }).replace(".", ""),
        quantidade,
      };
    });
  }, [producoes]);

  const colunas = [
    { key: "aguardando", label: "Aguardando", dados: producoes.filter(item => item.status === "PAUSADA") },
    { key: "preparo", label: "Em preparo", dados: producoes.filter(item => item.status === "EM_ANDAMENTO") },
    {
      key: "concluida",
      label: "Concluídos hoje",
      dados: producoes.filter(item => item.status === "CONCLUIDA" && new Date(item.dataProducao).toLocaleDateString("pt-BR") === hoje),
    },
  ];

  return (
    <div className="space-y-4">
      <Card className="p-5">
        <div className="mb-2 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">Produção da semana</h3>
            <p className="text-xs text-slate-400">Quantidade registrada nas ordens de preparo</p>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={150}>
          <BarChart data={grafico}>
            <XAxis dataKey="dia" tick={{ fontSize: 12, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
            <YAxis hide />
            <Tooltip
              formatter={valor => [numero(valor).toLocaleString("pt-BR"), "Produzido"]}
              contentStyle={{ borderRadius: 12, border: "1px solid #E2E8F0", fontSize: 12 }}
            />
            <Bar dataKey="quantidade" fill="#7A1420" radius={[6, 6, 0, 0]} barSize={28} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {colunas.map(coluna => (
          <section key={coluna.key} className="flex flex-col gap-3">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">{coluna.label}</h3>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600 dark:bg-slate-700 dark:text-slate-200">
                {coluna.dados.length}
              </span>
            </div>
            {!coluna.dados.length && (
              <div className="rounded-xl border border-dashed border-slate-200 p-5 text-center text-xs text-slate-400 dark:border-slate-700">
                Nenhuma ordem
              </div>
            )}
            {coluna.dados.map(ordem => (
              <OrdemCard
                key={ordem.id}
                ordem={ordem}
                tipo={coluna.key}
                editar={editar}
                cancelar={cancelar}
                pausar={pausar}
                iniciar={iniciar}
                concluir={concluir}
                estornar={estornar}
                processarEstoque={processarEstoque}
              />
            ))}
          </section>
        ))}
      </div>
    </div>
  );
}
