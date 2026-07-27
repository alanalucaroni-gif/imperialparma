import assert from "node:assert/strict";
import test from "node:test";
import { ServiceUnavailableException, UnprocessableEntityException } from "@nestjs/common";
import { LogisticaService } from "./logistica.service.js";

const dto = {
  origem: "Rua Assis Figueiredo, 555, Centro, Poços de Caldas - MG",
  destino: "Jardim Country Club, Poços de Caldas - MG",
  modo: "TWO_WHEELER" as const,
};

test("calcula quilômetros e minutos com a resposta do Google Routes", async () => {
  const fetchOriginal = globalThis.fetch;
  globalThis.fetch = async () => new Response(JSON.stringify({
    routes: [{ distanceMeters: 7350, duration: "720s" }],
  }), { status: 200, headers: { "Content-Type": "application/json" } });

  try {
    const service = new LogisticaService({ obterToken: async () => "chave-valida" } as any);
    const resultado = await service.calcularDistancia(dto);
    assert.equal(resultado.distanciaKm, 7.35);
    assert.equal(resultado.duracaoMinutos, 12);
    assert.equal(resultado.modo, "TWO_WHEELER");
    assert.equal(resultado.provedor, "GOOGLE_MAPS_ROUTES");
  } finally {
    globalThis.fetch = fetchOriginal;
  }
});

test("orienta configurar o Google Maps quando a chave não existe", async () => {
  const service = new LogisticaService({ obterToken: async () => null } as any);
  await assert.rejects(() => service.calcularDistancia(dto), ServiceUnavailableException);
});

test("repassa erro de endereço ou credencial devolvido pelo Google", async () => {
  const fetchOriginal = globalThis.fetch;
  globalThis.fetch = async () => new Response(JSON.stringify({
    error: { message: "API key not valid." },
  }), { status: 400, headers: { "Content-Type": "application/json" } });

  try {
    const service = new LogisticaService({ obterToken: async () => "chave-invalida" } as any);
    await assert.rejects(() => service.calcularDistancia(dto), UnprocessableEntityException);
  } finally {
    globalThis.fetch = fetchOriginal;
  }
});
