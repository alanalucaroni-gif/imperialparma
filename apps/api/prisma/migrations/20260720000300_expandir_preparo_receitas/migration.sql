ALTER TYPE "ProducaoReceitaStatus" ADD VALUE IF NOT EXISTS 'PAUSADA';

ALTER TABLE "receitas"
  ADD COLUMN "setorPadrao" TEXT,
  ADD COLUMN "instrucoesProducao" TEXT,
  ADD COLUMN "equipamentos" TEXT,
  ADD COLUMN "responsavelPadrao" TEXT,
  ADD COLUMN "etapas" JSONB;

ALTER TABLE "producoes_receitas"
  ADD COLUMN "setor" TEXT NOT NULL DEFAULT 'Produção geral',
  ADD COLUMN "quantidadePerdida" DECIMAL(14,3) NOT NULL DEFAULT 0,
  ADD COLUMN "motivoPerda" TEXT;