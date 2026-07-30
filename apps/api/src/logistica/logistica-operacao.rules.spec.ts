import assert from "node:assert/strict";
import test from "node:test";
import { LogisticaPedidoStatus } from "../generated/prisma/enums.js";
import { podeAlterarStatusLogistica } from "./logistica-operacao.service.js";

test("permite o fluxo operacional normal da entrega", () => {
  assert.equal(
    podeAlterarStatusLogistica(
      LogisticaPedidoStatus.AGUARDANDO,
      LogisticaPedidoStatus.COLETA,
    ),
    true,
  );
  assert.equal(
    podeAlterarStatusLogistica(
      LogisticaPedidoStatus.COLETA,
      LogisticaPedidoStatus.EM_ROTA,
    ),
    true,
  );
  assert.equal(
    podeAlterarStatusLogistica(
      LogisticaPedidoStatus.EM_ROTA,
      LogisticaPedidoStatus.ENTREGUE,
    ),
    true,
  );
});

test("permite retomar uma entrega depois de uma ocorrência", () => {
  assert.equal(
    podeAlterarStatusLogistica(
      LogisticaPedidoStatus.PROBLEMA,
      LogisticaPedidoStatus.EM_ROTA,
    ),
    true,
  );
});

test("aceita repetição idempotente do mesmo status", () => {
  assert.equal(
    podeAlterarStatusLogistica(
      LogisticaPedidoStatus.EM_ROTA,
      LogisticaPedidoStatus.EM_ROTA,
    ),
    true,
  );
});

test("impede reabrir entrega concluída ou cancelada", () => {
  assert.equal(
    podeAlterarStatusLogistica(
      LogisticaPedidoStatus.ENTREGUE,
      LogisticaPedidoStatus.EM_ROTA,
    ),
    false,
  );
  assert.equal(
    podeAlterarStatusLogistica(
      LogisticaPedidoStatus.CANCELADO,
      LogisticaPedidoStatus.AGUARDANDO,
    ),
    false,
  );
});
