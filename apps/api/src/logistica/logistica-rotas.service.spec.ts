import assert from "node:assert/strict";
import test from "node:test";
import { LogisticaPedidoStatus } from "../generated/prisma/enums.js";
import { LogisticaOperacaoService } from "./logistica-operacao.service.js";

const pedidoAtual = {
  id: "pedido-novo",
  status: LogisticaPedidoStatus.PRONTO,
  entregadorId: null,
  etapas: [],
  ocorrencias: [],
  localizacoes: [],
  valorPedido: 100,
  taxaEntregaCliente: 10,
  distanciaKm: 3,
  distanciaCobradaKm: 3,
  custoEstimado: 8,
  custoReal: null,
  entregador: null,
};

function criarServico(pedidosAtivos: Array<{ rotaId: string; ordemNaRota: number }>) {
  const entregador = {
    id: "entregador-banco",
    codigoExterno: "moto-1",
    nome: "Moto Teste",
    empresa: "Imperial",
    telefone: "35999999999",
    ativo: true,
  };
  const tx = {
    logisticaEntregador: {
      findFirst: async () => entregador,
      update: async () => entregador,
    },
    logisticaPedido: {
      findMany: async () => pedidosAtivos,
      update: async () => undefined,
      findUniqueOrThrow: async () => ({
        ...pedidoAtual,
        status: LogisticaPedidoStatus.COLETA,
        entregador,
      }),
    },
    logisticaPedidoEtapa: { create: async () => undefined },
    logisticaOcorrencia: {
      create: async () => undefined,
      updateMany: async () => undefined,
    },
  };
  const prisma = {
    logisticaPedido: { findUnique: async () => pedidoAtual },
    $transaction: async (callback: (cliente: typeof tx) => unknown) => callback(tx),
  };
  return new LogisticaOperacaoService(prisma as any);
}

test("impede despachar o quinto pedido para a mesma rota", async () => {
  const servico = criarServico([
    { rotaId: "ROTA-1", ordemNaRota: 1 },
    { rotaId: "ROTA-1", ordemNaRota: 2 },
    { rotaId: "ROTA-1", ordemNaRota: 3 },
    { rotaId: "ROTA-1", ordemNaRota: 4 },
  ]);

  await assert.rejects(
    () => servico.atualizarStatus(
      pedidoAtual.id,
      {
        status: LogisticaPedidoStatus.COLETA,
        entregador: {
          id: "moto-1",
          nome: "Moto Teste",
          empresa: "Imperial",
          telefone: "35999999999",
        },
      },
      "usuario-1",
    ),
    /4 pedidos na rota/,
  );
});
