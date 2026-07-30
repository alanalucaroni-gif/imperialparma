import assert from "node:assert/strict";
import test from "node:test";
import { IfoodPedidosService } from "./ifood-pedidos.service.js";

test("lista pedidos reais convertendo valores decimais", async () => {
  const prisma = {
    pedido: {
      findMany: async () => [{
        id: "pedido-1",
        codigo: "1234",
        valorTotal: "42.90",
        itens: [{
          id: "item-1",
          quantidade: "2",
          valorUnitario: "21.45",
        }],
      }],
    },
  };
  const service = new IfoodPedidosService(prisma as never, {} as never);

  const resultado = await service.listarPedidos();

  assert.equal(resultado.data[0].valorTotal, 42.9);
  assert.equal(resultado.data[0].itens[0].quantidade, 2);
  assert.equal(resultado.data[0].itens[0].valorUnitario, 21.45);
});

test("localiza ficha técnica ignorando acentos, caixa e espaços repetidos", async () => {
  const ficha = {
    id: "receita-1",
    nome: "PRODUTO 1 - NÃO ENTREGAR - Primeiro Nível",
    produtoFinal: null,
    itens: [],
  };
  const tx = {
    receita: {
      findFirst: async () => null,
      findMany: async () => [ficha],
    },
  };
  const service = new IfoodPedidosService({} as never, {} as never);

  const resultado = await (service as any).buscarReceitaDoItem(tx, {
    name: "  produto 1 - nao entregar - primeiro nivel  ",
  });

  assert.equal(resultado.id, ficha.id);
});
