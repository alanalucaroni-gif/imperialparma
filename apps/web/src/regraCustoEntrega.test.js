import assert from "node:assert/strict";
import test from "node:test";
import { calcularCustoDespacho, empresaUsaPrecoTabela } from "./regraCustoEntrega.js";

const tarifas = [{
  bairro: "CENTRO",
  valores: {
    "Moto City": 9,
    Zupt: 11,
  },
}];

const pedido = {
  bairro: "Centro",
  custoEstimado: 7.5,
};

test("Moto City sempre usa o preço da tabela", () => {
  const custo = calcularCustoDespacho({
    pedido,
    entregador: { tipo: "Moto City" },
    tarifas,
  });
  assert.equal(empresaUsaPrecoTabela("Moto City"), true);
  assert.equal(custo.origemValor, "tabela");
  assert.equal(custo.valor, 9);
});

test("Zupt sempre usa o preço da tabela", () => {
  const custo = calcularCustoDespacho({
    pedido,
    entregador: { tipo: "ZUPT" },
    tarifas,
  });
  assert.equal(empresaUsaPrecoTabela("ZUPT"), true);
  assert.equal(custo.origemValor, "tabela");
  assert.equal(custo.valor, 11);
});

test("Frota Imperial continua usando o cálculo por quilômetro", () => {
  const custo = calcularCustoDespacho({
    pedido,
    entregador: { tipo: "Frota Imperial" },
    tarifas,
  });
  assert.equal(custo.origemValor, "quilometro");
  assert.equal(custo.valor, 7.5);
});

test("bloqueia despacho de empresa tabelada sem preço para o bairro", () => {
  const custo = calcularCustoDespacho({
    pedido: { ...pedido, bairro: "BORTOLAN" },
    entregador: { tipo: "Moto City" },
    tarifas,
  });
  assert.equal(custo.valor, null);
  assert.match(custo.erro, /Tabela de Bairros/);
});
