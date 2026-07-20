ALTER TYPE "EntradaOrigem" ADD VALUE IF NOT EXISTS 'PRODUCAO';

ALTER TABLE "receitas"
  ADD COLUMN "produtoFinalId" TEXT;

ALTER TABLE "producoes_receitas"
  ADD COLUMN "estoqueProcessadoEm" TIMESTAMP(3);

CREATE INDEX "receitas_produtoFinalId_idx" ON "receitas"("produtoFinalId");

ALTER TABLE "receitas"
  ADD CONSTRAINT "receitas_produtoFinalId_fkey"
  FOREIGN KEY ("produtoFinalId") REFERENCES "insumos"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
