ALTER TYPE "EntradaOrigem" ADD VALUE IF NOT EXISTS 'PRODUCAO';

ALTER TABLE "receitas"
  ADD COLUMN IF NOT EXISTS "produtoFinalId" TEXT;

ALTER TABLE "producoes_receitas"
  ADD COLUMN IF NOT EXISTS "estoqueProcessadoEm" TIMESTAMP(3);

CREATE INDEX IF NOT EXISTS "receitas_produtoFinalId_idx" ON "receitas"("produtoFinalId");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'receitas_produtoFinalId_fkey'
      AND conrelid = '"receitas"'::regclass
  ) THEN
    ALTER TABLE "receitas"
      ADD CONSTRAINT "receitas_produtoFinalId_fkey"
      FOREIGN KEY ("produtoFinalId") REFERENCES "Insumo"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;
