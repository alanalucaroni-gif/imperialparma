function primeiroValor(objeto, caminhos, fallback = "") {
  for (const caminho of caminhos) {
    const valor = caminho.split(".").reduce((atual, chave) => atual?.[chave], objeto);
    if (valor !== undefined && valor !== null && valor !== "") return valor;
  }
  return fallback;
}

function numero(valor) {
  if (typeof valor === "number") return Number.isFinite(valor) ? valor : 0;
  const texto = String(valor ?? "").trim();
  const normalizado = texto.includes(",") ? texto.replace(/\./g, "").replace(",", ".") : texto;
  const convertido = Number(normalizado);
  return Number.isFinite(convertido) ? convertido : 0;
}

export const contratoPedidoSischef = [
  { imperial: "idExterno", descricao: "Identificador único do pedido no Sischef", obrigatorio: true },
  { imperial: "codigoPedido", descricao: "Número visível do pedido", obrigatorio: true },
  { imperial: "clienteNome", descricao: "Nome do cliente", obrigatorio: true },
  { imperial: "clienteTelefone", descricao: "Telefone para contato", obrigatorio: false },
  { imperial: "endereco", descricao: "Endereço completo da entrega", obrigatorio: true },
  { imperial: "bairro", descricao: "Bairro da entrega", obrigatorio: true },
  { imperial: "valorPedido", descricao: "Valor total do pedido", obrigatorio: true },
  { imperial: "taxaEntregaCliente", descricao: "Taxa de entrega cobrada do cliente", obrigatorio: false },
  { imperial: "formaPagamento", descricao: "Forma de pagamento informada no pedido", obrigatorio: false },
  { imperial: "canal", descricao: "Origem: iFood, Cardápio Web, balcão etc.", obrigatorio: false },
  { imperial: "observacoes", descricao: "Referência e observações da entrega", obrigatorio: false },
];

export function normalizarPedidoSischef(payload) {
  const enderecoObjeto = primeiroValor(payload, ["endereco", "cliente.endereco", "delivery.address"], {});
  const enderecoTexto = typeof enderecoObjeto === "string"
    ? enderecoObjeto
    : [
        enderecoObjeto.logradouro || enderecoObjeto.rua,
        enderecoObjeto.numero,
        enderecoObjeto.complemento,
      ].filter(Boolean).join(", ");

  return {
    idExterno: String(primeiroValor(payload, ["id", "pedidoId", "codigo", "order.id"])),
    codigoPedido: String(primeiroValor(payload, ["codigo", "numero", "order.displayId", "id"], "Sem número")),
    clienteNome: String(primeiroValor(payload, ["cliente.nome", "clienteNome", "customer.name"], "Cliente não informado")),
    clienteTelefone: String(primeiroValor(payload, ["cliente.telefone", "telefone", "customer.phone"], "")),
    endereco: enderecoTexto || String(primeiroValor(payload, ["enderecoCompleto", "delivery.address.formatted"], "")),
    bairro: String(primeiroValor(payload, ["endereco.bairro", "cliente.endereco.bairro", "delivery.address.neighborhood", "bairro"], "")),
    valorPedido: numero(primeiroValor(payload, ["valorTotal", "total", "order.total"], 0)),
    taxaEntregaCliente: numero(primeiroValor(payload, ["taxaEntrega", "deliveryFee", "order.deliveryFee"], 0)),
    formaPagamento: String(primeiroValor(payload, ["formaPagamento", "pagamento.descricao", "payments.0.method"], "")),
    canal: String(primeiroValor(payload, ["canal", "origem", "order.channel"], "Sischef")),
    observacoes: String(primeiroValor(payload, ["observacoes", "referencia", "delivery.observations"], "")),
    origem: "SISCHEF",
    payloadOriginal: payload,
  };
}

