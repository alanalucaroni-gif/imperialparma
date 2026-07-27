import assert from "node:assert/strict";
import test from "node:test";
import { normalizarPedidoSischefComRota } from "./logisticaSischef.js";

test("normaliza pagamento e calcula rota do pedido recebido do Sischef", async () => {
  const payload = {
    id: "SIS-1001",
    numero: "1001",
    cliente: {
      nome: "Cliente Teste",
      endereco: {
        logradouro: "Rua Pernambuco",
        numero: "100",
        bairro: "CENTRO",
      },
    },
    total: 85.5,
    pagamento: { descricao: "Cartão de crédito" },
  };

  const calcularDistancia = async ({ origem, destino, modo }) => ({
    origem,
    destino,
    modo,
    distanciaKm: 1.8,
    duracaoMinutos: 6,
  });

  const pedido = await normalizarPedidoSischefComRota(
    payload,
    calcularDistancia,
    "Rua Assis Figueiredo, 555, Centro, Poços de Caldas - MG",
  );

  assert.equal(pedido.formaPagamento, "CARTAO");
  assert.equal(pedido.distanciaKm, 1.8);
  assert.equal(pedido.origemDistancia, "GOOGLE_MAPS_ROUTES");
  assert.match(pedido.rotaCalculada.destino, /Rua Pernambuco, 100, CENTRO/);
});
