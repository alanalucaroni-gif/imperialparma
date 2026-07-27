function normalizar(texto) {
  return String(texto || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
}

const empresasComPrecoTabela = new Set(["motocity", "zupt"]);

export function empresaUsaPrecoTabela(empresa) {
  return empresasComPrecoTabela.has(normalizar(empresa));
}

export function valorTabelaEntrega(tarifas, empresa, bairro) {
  const destino = tarifas.find(item => normalizar(item.bairro) === normalizar(bairro));
  if (!destino) return null;
  const entrada = Object.entries(destino.valores || {})
    .find(([nomeEmpresa]) => normalizar(nomeEmpresa) === normalizar(empresa));
  const valor = Number(entrada?.[1]);
  return Number.isFinite(valor) && valor > 0 ? valor : null;
}

export function calcularCustoDespacho({ pedido, entregador, tarifas }) {
  const empresa = entregador?.tipo || entregador?.empresa || "";
  if (empresaUsaPrecoTabela(empresa)) {
    const valor = valorTabelaEntrega(tarifas, empresa, pedido.bairro);
    return valor == null
      ? {
          erro: `Cadastre o preço de ${empresa} para ${pedido.bairro} na Tabela de Bairros antes de despachar.`,
          origemValor: "tabela",
          valor: null,
          empresaTabela: empresa,
        }
      : {
          erro: null,
          origemValor: "tabela",
          valor,
          empresaTabela: empresa,
        };
  }

  return {
    erro: null,
    origemValor: "quilometro",
    valor: Number(pedido.custoEstimado || 0),
    empresaTabela: null,
  };
}
