ALTER TYPE "ParticipacaoCotacaoStatus" ADD VALUE IF NOT EXISTS 'ENTREGUE';
ALTER TYPE "ParticipacaoCotacaoStatus" ADD VALUE IF NOT EXISTS 'VISUALIZADO';
ALTER TYPE "ParticipacaoCotacaoStatus" ADD VALUE IF NOT EXISTS 'FALHA';

ALTER TABLE "Fornecedor" ADD COLUMN IF NOT EXISTS "avaliacao" DECIMAL(3,2);

ALTER TABLE "CotacaoFornecedor"
  ADD COLUMN IF NOT EXISTS "acrescimos" DECIMAL(14,2),
  ADD COLUMN IF NOT EXISTS "valorMinimoPedido" DECIMAL(14,2),
  ADD COLUMN IF NOT EXISTS "freteGratisAcima" DECIMAL(14,2),
  ADD COLUMN IF NOT EXISTS "detalhesPagamento" JSONB,
  ADD COLUMN IF NOT EXISTS "diasEntrega" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN IF NOT EXISTS "periodoEntrega" TEXT,
  ADD COLUMN IF NOT EXISTS "dataMaisProximaEntrega" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "dataLimitePedido" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "entregueEm" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "visualizadaEm" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "falhaEnvio" TEXT;

ALTER TABLE "CotacaoItemProposta"
  ADD COLUMN IF NOT EXISTS "quantidadeMinimaEmbalagem" DECIMAL(14,3);

ALTER TABLE "PedidoCompra"
  ADD COLUMN IF NOT EXISTS "acrescimos" DECIMAL(14,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "pdfEnviadoWhatsappEm" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "pdfWhatsappMensagemId" TEXT;

ALTER TABLE "ContaPagar" ADD COLUMN IF NOT EXISTS "pedidoCompraId" TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS "ContaPagar_pedidoCompraId_key" ON "ContaPagar"("pedidoCompraId");

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ContaPagar_pedidoCompraId_fkey') THEN
    ALTER TABLE "ContaPagar" ADD CONSTRAINT "ContaPagar_pedidoCompraId_fkey"
      FOREIGN KEY ("pedidoCompraId") REFERENCES "PedidoCompra"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;
