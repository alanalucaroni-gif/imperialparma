import assert from "node:assert/strict";
import test from "node:test";
import { JwtService } from "@nestjs/jwt";
import { LogisticaPedidoStatus } from "../generated/prisma/enums.js";
import { LogisticaRastreamentoService } from "./logistica-rastreamento.service.js";

const segredoTeste = "segredo-de-teste-logistica";

const pedido = {
  id: "pedido-1",
  codigoPedido: "#1001",
  status: LogisticaPedidoStatus.COLETA,
  entregadorId: "entregador-1",
  entregador: {
    id: "entregador-1",
    nome: "João",
    empresa: "Frota Imperial",
  },
};

function criarServico() {
  process.env.LOGISTICA_LINK_SECRET = segredoTeste;
  const prisma = {
    logisticaPedido: {
      findUnique: async () => pedido,
    },
  };
  return {
    jwt: new JwtService(),
    servico: new LogisticaRastreamentoService(
      prisma as any,
      new JwtService(),
      {} as any,
    ),
  };
}

function tokenDaUrl(url: string) {
  return decodeURIComponent(new URL(url).pathname.split("/").pop()!);
}

test("gera links temporários com finalidades independentes", async () => {
  const { jwt, servico } = criarServico();
  const links = await servico.gerarLinksTemporarios(
    pedido.id,
    "https://imperial.exemplo",
  );

  const entregador = await jwt.verifyAsync(tokenDaUrl(links.entregadorUrl), {
    secret: segredoTeste,
  });
  const rastreio = await jwt.verifyAsync(tokenDaUrl(links.rastreioUrl), {
    secret: segredoTeste,
  });

  assert.equal(entregador.finalidade, "entregador");
  assert.equal(entregador.entregadorId, pedido.entregadorId);
  assert.equal(rastreio.finalidade, "rastreio");
  assert.equal(rastreio.entregadorId, undefined);
  assert.equal(links.entregadorUrl.startsWith("https://imperial.exemplo/"), true);
});

test("link do cliente não autoriza ações do entregador", async () => {
  const { servico } = criarServico();
  const links = await servico.gerarLinksTemporarios(
    pedido.id,
    "https://imperial.exemplo",
  );

  await assert.rejects(
    () => servico.obterPainelEntregador(tokenDaUrl(links.rastreioUrl)),
    /Link inválido ou expirado/,
  );
});
