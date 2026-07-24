import React, { useState } from "react";
import { Copy, Pencil, Search, Trash2 } from "lucide-react";

const numero = valor => Number(valor || 0);
const dinheiro = valor => numero(valor).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const input = "mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#7A1420] dark:border-slate-600 dark:bg-slate-800";
const secondary = "inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 disabled:opacity-40 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200";
const primary = "inline-flex items-center justify-center gap-2 rounded-xl bg-[#7A1420] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#611018] disabled:opacity-50";

function Card({ children, className = "" }) {
  return (
    <section className={`rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800/60 ${className}`}>
      {children}
    </section>
  );
}

function Paginacao({ meta, mudar }) {
  if (!meta || meta.pages <= 1) return null;
  return (
    <div className="flex items-center justify-between border-t border-slate-100 px-3 py-3 text-xs text-slate-500 dark:border-slate-700">
      <span>{meta.total} receitas</span>
      <div className="flex gap-1">
        <button disabled={meta.page <= 1} onClick={() => mudar(meta.page - 1)} className={secondary}>Anterior</button>
        <button disabled={meta.page >= meta.pages} onClick={() => mudar(meta.page + 1)} className={secondary}>Próxima</button>
      </div>
    </div>
  );
}

export function OrdemPreparoForm({ receitas, funcionarios, onSalvar, salvando }) {
  const [receitaId, setReceitaId] = useState(receitas[0]?.id || "");
  const [funcionarioId, setFuncionarioId] = useState("");
  const [lotes, setLotes] = useState("1");
  const receita = receitas.find(item => item.id === receitaId);
  const quantidade = Math.max(1, numero(lotes)) * numero(receita?.rendimento);

  function enviar(evento) {
    evento.preventDefault();
    if (!receita || !funcionarioId) return;
    const data = new Date();
    data.setHours(12, 0, 0, 0);
    onSalvar({
      receitaId,
      funcionarioId,
      setor: receita.setorPadrao || "Cozinha",
      quantidadeProduzida: quantidade,
      unidade: receita.unidadeRendimento,
      dataProducao: data.toISOString(),
      status: "PAUSADA",
    });
  }

  return (
    <form onSubmit={enviar} className="space-y-4">
      {!receitas.length && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Cadastre e ative uma receita antes de criar a ordem.
        </div>
      )}
      {!funcionarios.length && (
        <div className="rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-800">
          Cadastre um funcionário ativo em Usuários &gt; Funcionários.
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-xs text-slate-500">
          Receita para preparar
          <select required value={receitaId} onChange={evento => setReceitaId(evento.target.value)} className={input}>
            <option value="">Selecione</option>
            {receitas.map(item => <option key={item.id} value={item.id}>{item.codigo} · {item.nome}</option>)}
          </select>
        </label>
        <label className="text-xs text-slate-500">
          Quantidade de lotes
          <input required type="number" min="1" step="1" value={lotes} onChange={evento => setLotes(evento.target.value)} className={input} />
        </label>
        <label className="text-xs text-slate-500 sm:col-span-2">
          Quem foi o funcionário responsável?
          <select required value={funcionarioId} onChange={evento => setFuncionarioId(evento.target.value)} className={input}>
            <option value="">Selecione o funcionário</option>
            {funcionarios.map(item => <option key={item.id} value={item.id}>{item.nome} · {item.setor}</option>)}
          </select>
        </label>
      </div>

      {receita && (
        <div className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-600 dark:bg-slate-900/50 dark:text-slate-300">
          Esta ordem produzirá <strong>{quantidade.toLocaleString("pt-BR")} {receita.unidadeRendimento}</strong> de{" "}
          {receita.produtoFinal?.nome || receita.nome}. A movimentação do estoque acontece somente ao concluir.
        </div>
      )}

      <div className="flex justify-end">
        <button disabled={salvando || !receitas.length || !funcionarios.length} className={primary}>
          {salvando ? "Criando..." : "Criar ordem de preparo"}
        </button>
      </div>
    </form>
  );
}

export default function ReceitasAntigas({
  dados,
  detalhe,
  carregando,
  filtros,
  mudar,
  categorias,
  selecionar,
  abrir,
  duplicar,
  alternar,
  excluir,
  meta,
  insumos,
}) {
  const custoLote = numero(detalhe?.custoEstimado);
  const custoUnidade = numero(detalhe?.rendimento) > 0 ? custoLote / numero(detalhe.rendimento) : 0;

  return (
    <div className="space-y-3">
      <div className="grid gap-2 md:grid-cols-[1fr_180px_150px]">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={filtros.busca}
            onChange={evento => mudar("busca", evento.target.value)}
            placeholder="Buscar receita por nome ou código..."
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm dark:border-slate-600 dark:bg-slate-800"
          />
        </div>
        <select value={filtros.categoria} onChange={evento => mudar("categoria", evento.target.value)} className={secondary}>
          <option value="">Todas as categorias</option>
          {categorias.map(item => <option key={item} value={item}>{item}</option>)}
        </select>
        <select value={filtros.status} onChange={evento => mudar("status", evento.target.value)} className={secondary}>
          <option value="ativo">Ativas</option>
          <option value="inativo">Inativas</option>
          <option value="todos">Todas</option>
        </select>
      </div>

      <div className="grid min-h-[430px] gap-3 xl:grid-cols-[300px_1fr]">
        <Card className="overflow-hidden">
          <div className="max-h-[560px] overflow-y-auto p-2">
            {dados.map(item => (
              <button
                key={item.id}
                onClick={() => selecionar(item)}
                className={`mb-1 w-full rounded-xl border px-3 py-3 text-left transition ${
                  detalhe?.id === item.id
                    ? "border-[#7A1420] bg-[#7A1420]/5"
                    : "border-transparent hover:bg-slate-50 dark:hover:bg-slate-700/30"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="text-sm font-semibold text-slate-800 dark:text-slate-100">{item.nome}</div>
                    <div className="mt-1 text-xs text-slate-400">
                      Rende {numero(item.rendimento).toLocaleString("pt-BR")} {item.unidadeRendimento} · {dinheiro(item.custoEstimado)}/lote
                    </div>
                  </div>
                  <span className="rounded-full bg-slate-100 px-2 py-1 font-mono text-[10px] text-slate-500 dark:bg-slate-700">
                    {item.codigo}
                  </span>
                </div>
              </button>
            ))}
          </div>
          {!dados.length && <p className="p-8 text-center text-sm text-slate-400">Nenhuma receita encontrada.</p>}
          <Paginacao meta={meta} mudar={pagina => mudar("page", pagina)} />
        </Card>

        <Card className="overflow-hidden">
          {carregando ? (
            <p className="p-12 text-center text-sm text-slate-400">Carregando ficha técnica...</p>
          ) : detalhe ? (
            <>
              <div className="flex flex-col gap-4 border-b border-slate-200 p-4 sm:flex-row sm:items-start sm:justify-between dark:border-slate-700">
                <div>
                  <div className="font-mono text-xs text-slate-400">{detalhe.codigo}</div>
                  <h3 className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">{detalhe.nome}</h3>
                  <p className="text-xs text-slate-400">
                    {detalhe.categoria || "Sem categoria"} · rendimento de {numero(detalhe.rendimento).toLocaleString("pt-BR")} {detalhe.unidadeRendimento}
                  </p>
                </div>
                <div className="flex flex-wrap items-start gap-2">
                  <div className="rounded-xl bg-slate-100 px-3 py-2 text-right dark:bg-slate-700">
                    <div className="text-[10px] uppercase text-slate-400">Custo/lote</div>
                    <strong className="text-sm">{dinheiro(custoLote)}</strong>
                  </div>
                  <div className="rounded-xl bg-slate-100 px-3 py-2 text-right dark:bg-slate-700">
                    <div className="text-[10px] uppercase text-slate-400">Custo/unidade</div>
                    <strong className="text-sm">{dinheiro(custoUnidade)}</strong>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 border-b border-slate-100 px-4 py-3 dark:border-slate-700">
                <button onClick={() => abrir(detalhe)} className={secondary}><Pencil size={15} />Editar ficha</button>
                <button onClick={() => duplicar(detalhe)} className={secondary}><Copy size={15} />Duplicar</button>
                <button onClick={() => alternar(detalhe)} className={secondary}>{detalhe.ativo ? "Inativar" : "Ativar"}</button>
                {!detalhe._count?.producoes && (
                  <button onClick={() => excluir(detalhe)} className="inline-flex items-center gap-2 rounded-xl border border-rose-200 px-3 py-2 text-sm text-rose-600">
                    <Trash2 size={15} />Excluir
                  </button>
                )}
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[660px] text-sm">
                  <thead className="border-b border-slate-100 text-left text-[11px] uppercase text-slate-400 dark:border-slate-700">
                    <tr>
                      <th className="px-4 py-3">Insumo</th>
                      <th className="px-4 py-3 text-right">Quantidade</th>
                      <th className="px-4 py-3 text-right">Disponível</th>
                      <th className="px-4 py-3 text-right">Situação</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(detalhe.itens || []).map(item => {
                      const estoque = insumos.find(valor => valor.id === item.insumoId);
                      const necessario = numero(item.quantidade);
                      const disponivel = numero(estoque?.qtd);
                      const ok = disponivel >= necessario;
                      return (
                        <tr key={item.id || item.insumoId || item.nome} className="border-b border-slate-50 dark:border-slate-700/60">
                          <td className="px-4 py-3">
                            <div className="font-medium">{item.nome}</div>
                            <div className="font-mono text-[10px] text-slate-400">{estoque?.cod || item.insumo?.codigo || "Sem vínculo"}</div>
                          </td>
                          <td className="px-4 py-3 text-right font-medium">{necessario.toLocaleString("pt-BR")} {item.unidade}</td>
                          <td className="px-4 py-3 text-right text-slate-500">{disponivel.toLocaleString("pt-BR")} {estoque?.un || item.unidade}</td>
                          <td className="px-4 py-3 text-right">
                            <span className={`rounded-full px-2 py-1 text-[10px] font-semibold ${ok ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>
                              {ok ? "Disponível" : "Repor"}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {!detalhe.itens?.length && <p className="p-10 text-center text-sm text-slate-400">Esta ficha ainda não possui ingredientes.</p>}
              </div>
            </>
          ) : (
            <p className="p-12 text-center text-sm text-slate-400">Selecione uma receita para visualizar a ficha.</p>
          )}
        </Card>
      </div>
    </div>
  );
}
