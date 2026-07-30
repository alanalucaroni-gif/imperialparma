import assert from "node:assert/strict";
import test from "node:test";
import { LogisticaPedidoStatus } from "../generated/prisma/enums.js";
import { podeAtualizarStatusEntregador } from "./logistica-rastreamento.service.js";

test("entregador segue as etapas da coleta até o destino", () => {
  assert.equal(
    podeAtualizarStatusEntregador(
      LogisticaPedidoStatus.COLETA,
      LogisticaPedidoStatus.NA_LOJA,
    ),
    true,
  );
  assert.equal(
    podeAtualizarStatusEntregador(
      LogisticaPedidoStatus.NA_LOJA,
      LogisticaPedidoStatus.EM_ROTA,
    ),
    true,
  );
  assert.equal(
    podeAtualizarStatusEntregador(
      LogisticaPedidoStatus.EM_ROTA,
      LogisticaPedidoStatus.NO_DESTINO,
    ),
    true,
  );
  assert.equal(
    podeAtualizarStatusEntregador(
      LogisticaPedidoStatus.NO_DESTINO,
      LogisticaPedidoStatus.ENTREGUE,
    ),
    true,
  );
});

test("entregador não pode cancelar ou reabrir entrega finalizada", () => {
  assert.equal(
    podeAtualizarStatusEntregador(
      LogisticaPedidoStatus.EM_ROTA,
      LogisticaPedidoStatus.CANCELADO,
    ),
    false,
  );
  assert.equal(
    podeAtualizarStatusEntregador(
      LogisticaPedidoStatus.ENTREGUE,
      LogisticaPedidoStatus.EM_ROTA,
    ),
    false,
  );
});
