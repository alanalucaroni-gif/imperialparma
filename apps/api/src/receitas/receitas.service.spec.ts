import assert from "node:assert/strict";
import test from "node:test";
import { EntradaOrigem, MovimentacaoTipo, ProducaoReceitaStatus } from "../generated/prisma/client.js";
import { ReceitasService } from "./receitas.service.js";

type ItemEstoque = {
  id: string;
  codigo: string;
  nome: string;
  unidade: string;
  quantidade: number;
  custoUnitario: number;
  ativo: boolean;
};

function criarCenario() {
  const ingrediente: ItemEstoque = {
    id: "insumo-arroz",
    codigo: "INS-ARROZ",
    nome: "ARROZ",
    unidade: "kg",
    quantidade: 100,
    custoUnitario: 2,
    ativo: true,
  };
  const produtoFinal: ItemEstoque = {
    id: "produto-arroz-pronto",
    codigo: "PROD-ARROZ",
    nome: "ARROZ PRONTO",
    unidade: "kg",
    quantidade: 2,
    custoUnitario: 5,
    ativo: true,
  };
  const funcionario = {
    id: "funcionario-1",
    codigo: 1,
    nome: "ANA COZINHA",
    setor: "Cozinha",
    cargo: "Cozinheira",
    ativo: true,
  };
  const receita = {
    id: "receita-1",
    codigo: "REC-TESTE",
    nome: "ARROZ PRONTO",
    categoria: "Guarnições",
    rendimento: 10,
    unidadeRendimento: "kg",
    tempoPreparoMinutos: 60,
    produtoFinalId: produtoFinal.id,
    produtoFinal,
    ativo: true,
    itens: [
      {
        id: "item-receita-1",
        insumoId: ingrediente.id,
        nome: ingrediente.nome,
        quantidade: 5,
        unidade: "kg",
        custoUnitario: 2,
      },
    ],
  };
  const producao = {
    id: "producao-1",
    receitaId: receita.id,
    funcionarioId: funcionario.id,
    setor: "Cozinha",
    quantidadeProduzida: 10,
    quantidadePerdida: 0,
    unidade: "kg",
    dataProducao: new Date("2026-07-24T12:00:00.000Z"),
    horaInicio: new Date("2026-07-24T15:00:00.000Z"),
    horaFim: null as Date | null,
    lote: "LOTE-TESTE",
    validade: null,
    status: ProducaoReceitaStatus.EM_ANDAMENTO,
    estoqueProcessadoEm: null as Date | null,
    canceladaEm: null as Date | null,
    motivoCancelamento: null as string | null,
    observacoes: null,
    receita,
    funcionario,
  };

  const estoque = new Map<string, ItemEstoque>([
    [ingrediente.id, ingrediente],
    [produtoFinal.id, produtoFinal],
  ]);
  const movimentos: Array<Record<string, any>> = [];

  const producaoReceita = {
    async findUnique({ where }: any) {
      return where.id === producao.id ? producao : null;
    },
    async findUniqueOrThrow({ where }: any) {
      if (where.id !== producao.id) throw new Error("Produção não encontrada");
      return producao;
    },
    async findMany() {
      return [producao];
    },
    async update({ where, data }: any) {
      if (where.id !== producao.id) throw new Error("Produção não encontrada");
      Object.assign(producao, data);
      return producao;
    },
    async updateMany({ where, data }: any) {
      if (where.id !== producao.id || (where.status && where.status !== producao.status)) return { count: 0 };
      Object.assign(producao, data);
      return { count: 1 };
    },
  };

  const insumo = {
    async findUnique({ where }: any) {
      return estoque.get(where.id) ?? null;
    },
    async findUniqueOrThrow({ where }: any) {
      const item = estoque.get(where.id);
      if (!item) throw new Error("Item de estoque não encontrado");
      return item;
    },
    async updateMany({ where, data }: any) {
      const item = estoque.get(where.id);
      if (!item) return { count: 0 };
      const minimo = where.quantidade?.gte;
      if (minimo != null && item.quantidade < Number(minimo)) return { count: 0 };
      if (data.quantidade?.decrement != null) item.quantidade -= Number(data.quantidade.decrement);
      if (data.quantidade?.increment != null) item.quantidade += Number(data.quantidade.increment);
      return { count: 1 };
    },
    async update({ where, data }: any) {
      const item = estoque.get(where.id);
      if (!item) throw new Error("Item de estoque não encontrado");
      if (data.quantidade?.decrement != null) item.quantidade -= Number(data.quantidade.decrement);
      if (data.quantidade?.increment != null) item.quantidade += Number(data.quantidade.increment);
      if (data.custoUnitario != null) item.custoUnitario = Number(data.custoUnitario);
      return item;
    },
  };

  const movimentacao = {
    async create({ data }: any) {
      const movimento = { id: `mov-${movimentos.length + 1}`, criadoEm: new Date(), ...data };
      movimentos.push(movimento);
      return movimento;
    },
    async findMany({ where }: any) {
      return movimentos
        .filter(item =>
          item.origem === where.origem
          && item.tipo === where.tipo
          && item.referenciaId === where.referenciaId
        )
        .slice()
        .reverse();
    },
  };

  const prisma: any = {
    producaoReceita,
    insumo,
    movimentacao,
    receita: {
      async findUnique({ where }: any) {
        return where.id === receita.id ? receita : null;
      },
    },
    funcionario: {
      async findUnique({ where }: any) {
        return where.id === funcionario.id ? funcionario : null;
      },
    },
    async $transaction(arg: any) {
      if (Array.isArray(arg)) return Promise.all(arg);
      return arg({ producaoReceita, insumo, movimentacao });
    },
  };

  return {
    service: new ReceitasService(prisma),
    ingrediente,
    produtoFinal,
    funcionario,
    producao,
    movimentos,
  };
}

test("concluir movimenta o estoque, registra o funcionário e excluir estorna tudo", async () => {
  const { service, ingrediente, produtoFinal, funcionario, producao, movimentos } = criarCenario();
  const filtroRanking = {
    page: 1,
    limit: 50,
    ordenarPor: "dataProducao" as const,
    direcao: "desc" as const,
    tipo: "registros" as const,
  };

  assert.deepEqual(await service.ranking(filtroRanking), [], "ordem em andamento não deve entrar no ranking");

  const concluida = await service.atualizarProducao(producao.id, {
    status: ProducaoReceitaStatus.CONCLUIDA,
    horaFim: "2026-07-24T15:45:00.000Z",
  });

  assert.equal(concluida.status, ProducaoReceitaStatus.CONCLUIDA);
  assert.ok(concluida.estoqueProcessadoEm, "a ordem precisa confirmar o processamento do estoque");
  assert.equal(ingrediente.quantidade, 95, "deve consumir 5 kg do ingrediente");
  assert.equal(produtoFinal.quantidade, 12, "deve adicionar 10 kg ao produto final");
  assert.deepEqual(
    movimentos.map(item => [item.tipo, item.origem, item.quantidade]),
    [
      [MovimentacaoTipo.PRODUCAO, EntradaOrigem.PRODUCAO, -5],
      [MovimentacaoTipo.PRODUCAO, EntradaOrigem.PRODUCAO, 10],
    ],
  );

  const ranking = await service.ranking(filtroRanking);
  assert.equal(ranking.length, 1);
  assert.equal(ranking[0].funcionario.id, funcionario.id);
  assert.equal(ranking[0].concluidas, 1);
  assert.equal(ranking[0].quantidadeTotal, 10);

  const estornada = await service.estornarProducao(producao.id, "Ordem lançada por engano");

  assert.equal(estornada.status, ProducaoReceitaStatus.CANCELADA);
  assert.equal(ingrediente.quantidade, 100, "o ingrediente deve voltar ao saldo inicial");
  assert.equal(produtoFinal.quantidade, 2, "o produto final deve voltar ao saldo inicial");
  assert.equal(Number(produtoFinal.custoUnitario.toFixed(6)), 5, "o custo médio do produto final também deve ser restaurado");
  assert.equal(movimentos.length, 4, "o estorno deve manter as duas movimentações originais e criar duas compensações");
  assert.deepEqual(await service.ranking(filtroRanking), [], "ordem estornada não deve permanecer no ranking");
});
