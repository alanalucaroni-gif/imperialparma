ALTER TYPE "CompraStatus" ADD VALUE IF NOT EXISTS 'GERADO';
ALTER TYPE "CompraStatus" ADD VALUE IF NOT EXISTS 'ENVIADO';
ALTER TYPE "CompraStatus" ADD VALUE IF NOT EXISTS 'CONFIRMADO';
ALTER TYPE "CompraStatus" ADD VALUE IF NOT EXISTS 'AGUARDANDO_ENTREGA';
ALTER TYPE "CompraStatus" ADD VALUE IF NOT EXISTS 'RECEBIDO_PARCIALMENTE';
ALTER TYPE "CompraStatus" ADD VALUE IF NOT EXISTS 'DIVERGENTE';

ALTER TYPE "CotacaoStatus" ADD VALUE IF NOT EXISTS 'RASCUNHO';
ALTER TYPE "CotacaoStatus" ADD VALUE IF NOT EXISTS 'ENVIADA';
ALTER TYPE "CotacaoStatus" ADD VALUE IF NOT EXISTS 'EM_ANALISE';
ALTER TYPE "CotacaoStatus" ADD VALUE IF NOT EXISTS 'FINALIZADA';
ALTER TYPE "CotacaoStatus" ADD VALUE IF NOT EXISTS 'VENCIDA';

CREATE TYPE "ParticipacaoCotacaoStatus" AS ENUM ('LINK_NAO_ENVIADO', 'ENVIADO', 'LINK_ACESSADO', 'FORMULARIO_INICIADO', 'RASCUNHO_SALVO', 'RESPONDIDO', 'RESPOSTA_ALTERADA', 'VENCIDO', 'RECUSADO', 'CANCELADO');
CREATE TYPE "RecebimentoItemStatus" AS ENUM ('PENDENTE', 'RECEBIDO_CORRETAMENTE', 'RECEBIDO_PARCIALMENTE', 'PRODUTO_DIVERGENTE', 'QUANTIDADE_DIVERGENTE', 'VALOR_DIVERGENTE', 'PRODUTO_RECUSADO', 'PRODUTO_AVARIADO');

ALTER TABLE "Insumo"
  ADD COLUMN "ultimoFornecedorId" TEXT,
  ADD COLUMN "ultimaCompraEm" TIMESTAMP(3),
  ADD COLUMN "ultimoCustoCompra" DECIMAL(14,4);

ALTER TABLE "PedidoCompra"
  ADD COLUMN "cotacaoId" TEXT,
  ADD COLUMN "frete" DECIMAL(14,2) NOT NULL DEFAULT 0,
  ADD COLUMN "desconto" DECIMAL(14,2) NOT NULL DEFAULT 0,
  ADD COLUMN "condicaoPagamento" TEXT,
  ADD COLUMN "formaPagamento" TEXT,
  ADD COLUMN "dataPrevistaEntrega" TIMESTAMP(3),
  ADD COLUMN "responsavelCompra" TEXT,
  ADD COLUMN "observacoes" TEXT,
  ADD COLUMN "finalizadoEm" TIMESTAMP(3),
  ADD COLUMN "recebidoEm" TIMESTAMP(3),
  ADD COLUMN "canceladoEm" TIMESTAMP(3),
  ADD COLUMN "motivoCancelamento" TEXT,
  ADD COLUMN "pdfArquivo" BYTEA,
  ADD COLUMN "pdfNome" TEXT,
  ADD COLUMN "pdfGeradoEm" TIMESTAMP(3);
ALTER TABLE "PedidoCompra" ALTER COLUMN "status" SET DEFAULT 'GERADO';

ALTER TABLE "PedidoCompraItem"
  ADD COLUMN "unidade" TEXT,
  ADD COLUMN "marca" TEXT,
  ADD COLUMN "embalagem" TEXT,
  ADD COLUMN "desconto" DECIMAL(14,2) NOT NULL DEFAULT 0,
  ADD COLUMN "observacoes" TEXT;

ALTER TABLE "Cotacao"
  ADD COLUMN "prazoResposta" TIMESTAMP(3),
  ADD COLUMN "observacoes" TEXT,
  ADD COLUMN "finalizadaEm" TIMESTAMP(3),
  ADD COLUMN "finalizadaPorId" TEXT,
  ADD COLUMN "motivoFinalizacao" TEXT,
  ADD COLUMN "economiaTotal" DECIMAL(14,2);

ALTER TABLE "CotacaoFornecedor"
  ADD COLUMN "status" "ParticipacaoCotacaoStatus" NOT NULL DEFAULT 'LINK_NAO_ENVIADO',
  ADD COLUMN "tokenPublico" TEXT,
  ADD COLUMN "tokenValidoAte" TIMESTAMP(3),
  ADD COLUMN "tokenCanceladoEm" TIMESTAMP(3),
  ADD COLUMN "desconto" DECIMAL(14,2),
  ADD COLUMN "prazoPagamento" INTEGER,
  ADD COLUMN "validadeProposta" TIMESTAMP(3),
  ADD COLUMN "responsavelNome" TEXT,
  ADD COLUMN "responsavelTelefone" TEXT,
  ADD COLUMN "observacoesGerais" TEXT,
  ADD COLUMN "anexos" JSONB,
  ADD COLUMN "numeroWhatsappEnvio" TEXT,
  ADD COLUMN "acessadaEm" TIMESTAMP(3),
  ADD COLUMN "iniciadaEm" TIMESTAMP(3),
  ADD COLUMN "rascunhoEm" TIMESTAMP(3),
  ADD COLUMN "ipResposta" TEXT,
  ADD COLUMN "versao" INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN "bloqueada" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "recusadaEm" TIMESTAMP(3),
  ADD COLUMN "motivoRecusa" TEXT,
  ADD COLUMN "detalheRecusa" TEXT;

CREATE TABLE "CotacaoItem" (
  "id" TEXT NOT NULL,
  "cotacaoId" TEXT NOT NULL,
  "insumoId" TEXT NOT NULL,
  "quantidadeSolicitada" DECIMAL(14,3) NOT NULL,
  "unidade" TEXT NOT NULL,
  "marcaPreferencial" TEXT,
  "embalagemSolicitada" TEXT,
  "observacoes" TEXT,
  "dataDesejadaEntrega" TIMESTAMP(3),
  "ultimoPreco" DECIMAL(14,4),
  "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "CotacaoItem_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CotacaoItemProposta" (
  "id" TEXT NOT NULL,
  "participacaoId" TEXT NOT NULL,
  "cotacaoItemId" TEXT NOT NULL,
  "disponivel" BOOLEAN NOT NULL DEFAULT true,
  "precoUnitario" DECIMAL(14,4),
  "marcaOferecida" TEXT,
  "embalagem" TEXT,
  "quantidadeEmbalagem" DECIMAL(14,3),
  "quantidadeMinima" DECIMAL(14,3),
  "prazoDias" INTEGER,
  "dataPrevistaEntrega" TIMESTAMP(3),
  "observacoes" TEXT,
  "valorTotal" DECIMAL(14,2),
  "selecionada" BOOLEAN NOT NULL DEFAULT false,
  "atualizadoEm" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "CotacaoItemProposta_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CotacaoAcesso" (
  "id" TEXT NOT NULL,
  "participacaoId" TEXT NOT NULL,
  "ip" TEXT,
  "userAgent" TEXT,
  "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "CotacaoAcesso_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "RecebimentoCompra" (
  "id" TEXT NOT NULL,
  "pedidoCompraId" TEXT NOT NULL,
  "fornecedorId" TEXT NOT NULL,
  "numeroNotaFiscal" TEXT,
  "serieNotaFiscal" TEXT,
  "chaveAcesso" TEXT,
  "dataEmissao" TIMESTAMP(3),
  "dataEntrada" TIMESTAMP(3),
  "valorProdutos" DECIMAL(14,2),
  "frete" DECIMAL(14,2),
  "desconto" DECIMAL(14,2),
  "impostos" DECIMAL(14,2),
  "valorTotal" DECIMAL(14,2),
  "anexosNota" JSONB,
  "observacoes" TEXT,
  "status" "CompraStatus" NOT NULL DEFAULT 'PENDENTE',
  "estoqueConfirmadoEm" TIMESTAMP(3),
  "estoqueConfirmadoPorId" TEXT,
  "criadoPorId" TEXT,
  "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "atualizadoEm" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "RecebimentoCompra_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "RecebimentoCompraItem" (
  "id" TEXT NOT NULL,
  "recebimentoId" TEXT NOT NULL,
  "pedidoCompraItemId" TEXT NOT NULL,
  "insumoId" TEXT NOT NULL,
  "quantidadePedida" DECIMAL(14,3) NOT NULL,
  "quantidadeRecebida" DECIMAL(14,3) NOT NULL,
  "quantidadeRecusada" DECIMAL(14,3) NOT NULL DEFAULT 0,
  "fatorConversaoEstoque" DECIMAL(14,4) NOT NULL DEFAULT 1,
  "unidade" TEXT NOT NULL,
  "lote" TEXT,
  "dataFabricacao" TIMESTAMP(3),
  "dataValidade" TIMESTAMP(3),
  "valorUnitarioRecebido" DECIMAL(14,4) NOT NULL,
  "marcaRecebida" TEXT,
  "situacao" "RecebimentoItemStatus" NOT NULL DEFAULT 'PENDENTE',
  "observacoes" TEXT,
  CONSTRAINT "RecebimentoCompraItem_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "HistoricoPrecoCompra" (
  "id" TEXT NOT NULL,
  "insumoId" TEXT NOT NULL,
  "fornecedorId" TEXT NOT NULL,
  "quantidade" DECIMAL(14,3) NOT NULL,
  "unidade" TEXT NOT NULL,
  "precoUnitario" DECIMAL(14,4) NOT NULL,
  "frete" DECIMAL(14,2) NOT NULL DEFAULT 0,
  "desconto" DECIMAL(14,2) NOT NULL DEFAULT 0,
  "custoFinal" DECIMAL(14,4) NOT NULL,
  "cotacaoCodigo" TEXT,
  "pedidoCodigo" TEXT,
  "notaFiscalNumero" TEXT,
  "usuarioId" TEXT,
  "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "HistoricoPrecoCompra_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CompraAuditoria" (
  "id" TEXT NOT NULL,
  "entidade" TEXT NOT NULL,
  "entidadeId" TEXT NOT NULL,
  "acao" TEXT NOT NULL,
  "usuarioId" TEXT,
  "detalhes" JSONB,
  "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "CompraAuditoria_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "CotacaoFornecedor_tokenPublico_key" ON "CotacaoFornecedor"("tokenPublico");
CREATE INDEX "CotacaoFornecedor_status_tokenValidoAte_idx" ON "CotacaoFornecedor"("status", "tokenValidoAte");
CREATE INDEX "Cotacao_status_prazoResposta_idx" ON "Cotacao"("status", "prazoResposta");
CREATE INDEX "PedidoCompra_cotacaoId_idx" ON "PedidoCompra"("cotacaoId");
CREATE INDEX "PedidoCompra_fornecedorId_status_idx" ON "PedidoCompra"("fornecedorId", "status");
CREATE INDEX "PedidoCompraItem_pedidoCompraId_idx" ON "PedidoCompraItem"("pedidoCompraId");
CREATE INDEX "PedidoCompraItem_insumoId_idx" ON "PedidoCompraItem"("insumoId");
CREATE UNIQUE INDEX "CotacaoItem_cotacaoId_insumoId_key" ON "CotacaoItem"("cotacaoId", "insumoId");
CREATE INDEX "CotacaoItem_insumoId_idx" ON "CotacaoItem"("insumoId");
CREATE UNIQUE INDEX "CotacaoItemProposta_participacaoId_cotacaoItemId_key" ON "CotacaoItemProposta"("participacaoId", "cotacaoItemId");
CREATE INDEX "CotacaoItemProposta_cotacaoItemId_idx" ON "CotacaoItemProposta"("cotacaoItemId");
CREATE INDEX "CotacaoAcesso_participacaoId_criadoEm_idx" ON "CotacaoAcesso"("participacaoId", "criadoEm");
CREATE UNIQUE INDEX "RecebimentoCompra_chaveAcesso_key" ON "RecebimentoCompra"("chaveAcesso");
CREATE INDEX "RecebimentoCompra_pedidoCompraId_status_idx" ON "RecebimentoCompra"("pedidoCompraId", "status");
CREATE INDEX "RecebimentoCompraItem_recebimentoId_idx" ON "RecebimentoCompraItem"("recebimentoId");
CREATE INDEX "RecebimentoCompraItem_insumoId_idx" ON "RecebimentoCompraItem"("insumoId");
CREATE INDEX "HistoricoPrecoCompra_insumoId_criadoEm_idx" ON "HistoricoPrecoCompra"("insumoId", "criadoEm");
CREATE INDEX "HistoricoPrecoCompra_fornecedorId_criadoEm_idx" ON "HistoricoPrecoCompra"("fornecedorId", "criadoEm");
CREATE INDEX "CompraAuditoria_entidade_entidadeId_criadoEm_idx" ON "CompraAuditoria"("entidade", "entidadeId", "criadoEm");

ALTER TABLE "Insumo" ADD CONSTRAINT "Insumo_ultimoFornecedorId_fkey" FOREIGN KEY ("ultimoFornecedorId") REFERENCES "Fornecedor"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "PedidoCompra" ADD CONSTRAINT "PedidoCompra_cotacaoId_fkey" FOREIGN KEY ("cotacaoId") REFERENCES "Cotacao"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "CotacaoItem" ADD CONSTRAINT "CotacaoItem_cotacaoId_fkey" FOREIGN KEY ("cotacaoId") REFERENCES "Cotacao"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CotacaoItem" ADD CONSTRAINT "CotacaoItem_insumoId_fkey" FOREIGN KEY ("insumoId") REFERENCES "Insumo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "CotacaoItemProposta" ADD CONSTRAINT "CotacaoItemProposta_participacaoId_fkey" FOREIGN KEY ("participacaoId") REFERENCES "CotacaoFornecedor"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CotacaoItemProposta" ADD CONSTRAINT "CotacaoItemProposta_cotacaoItemId_fkey" FOREIGN KEY ("cotacaoItemId") REFERENCES "CotacaoItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CotacaoAcesso" ADD CONSTRAINT "CotacaoAcesso_participacaoId_fkey" FOREIGN KEY ("participacaoId") REFERENCES "CotacaoFornecedor"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "RecebimentoCompra" ADD CONSTRAINT "RecebimentoCompra_pedidoCompraId_fkey" FOREIGN KEY ("pedidoCompraId") REFERENCES "PedidoCompra"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "RecebimentoCompra" ADD CONSTRAINT "RecebimentoCompra_fornecedorId_fkey" FOREIGN KEY ("fornecedorId") REFERENCES "Fornecedor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "RecebimentoCompraItem" ADD CONSTRAINT "RecebimentoCompraItem_recebimentoId_fkey" FOREIGN KEY ("recebimentoId") REFERENCES "RecebimentoCompra"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "RecebimentoCompraItem" ADD CONSTRAINT "RecebimentoCompraItem_pedidoCompraItemId_fkey" FOREIGN KEY ("pedidoCompraItemId") REFERENCES "PedidoCompraItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "RecebimentoCompraItem" ADD CONSTRAINT "RecebimentoCompraItem_insumoId_fkey" FOREIGN KEY ("insumoId") REFERENCES "Insumo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "HistoricoPrecoCompra" ADD CONSTRAINT "HistoricoPrecoCompra_insumoId_fkey" FOREIGN KEY ("insumoId") REFERENCES "Insumo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "HistoricoPrecoCompra" ADD CONSTRAINT "HistoricoPrecoCompra_fornecedorId_fkey" FOREIGN KEY ("fornecedorId") REFERENCES "Fornecedor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
