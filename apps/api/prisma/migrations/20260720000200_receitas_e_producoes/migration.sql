CREATE TYPE "ProducaoReceitaStatus" AS ENUM ('EM_ANDAMENTO', 'CONCLUIDA', 'CANCELADA');

CREATE TABLE "receitas" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "categoria" TEXT,
    "descricao" TEXT,
    "fotoUrl" TEXT,
    "rendimento" DECIMAL(14,3) NOT NULL,
    "unidadeRendimento" TEXT NOT NULL,
    "tempoPreparoMinutos" INTEGER,
    "modoPreparo" TEXT,
    "custoEstimado" DECIMAL(14,4),
    "observacoes" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "receitas_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "itens_receita" (
    "id" TEXT NOT NULL,
    "receitaId" TEXT NOT NULL,
    "insumoId" TEXT,
    "nome" TEXT NOT NULL,
    "quantidade" DECIMAL(14,3) NOT NULL,
    "unidade" TEXT NOT NULL,
    "custoUnitario" DECIMAL(14,4),
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "itens_receita_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "producoes_receitas" (
    "id" TEXT NOT NULL,
    "receitaId" TEXT NOT NULL,
    "funcionarioId" TEXT NOT NULL,
    "quantidadeProduzida" DECIMAL(14,3) NOT NULL,
    "unidade" TEXT NOT NULL,
    "dataProducao" TIMESTAMP(3) NOT NULL,
    "horaInicio" TIMESTAMP(3),
    "horaFim" TIMESTAMP(3),
    "lote" TEXT,
    "validade" TIMESTAMP(3),
    "status" "ProducaoReceitaStatus" NOT NULL DEFAULT 'EM_ANDAMENTO',
    "observacoes" TEXT,
    "canceladaEm" TIMESTAMP(3),
    "motivoCancelamento" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "producoes_receitas_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "receitas_codigo_key" ON "receitas"("codigo");
CREATE INDEX "receitas_nome_idx" ON "receitas"("nome");
CREATE INDEX "receitas_categoria_ativo_idx" ON "receitas"("categoria", "ativo");
CREATE INDEX "itens_receita_receitaId_idx" ON "itens_receita"("receitaId");
CREATE INDEX "itens_receita_insumoId_idx" ON "itens_receita"("insumoId");
CREATE INDEX "producoes_receitas_receitaId_dataProducao_idx" ON "producoes_receitas"("receitaId", "dataProducao");
CREATE INDEX "producoes_receitas_funcionarioId_dataProducao_idx" ON "producoes_receitas"("funcionarioId", "dataProducao");
CREATE INDEX "producoes_receitas_status_dataProducao_idx" ON "producoes_receitas"("status", "dataProducao");

ALTER TABLE "itens_receita" ADD CONSTRAINT "itens_receita_receitaId_fkey" FOREIGN KEY ("receitaId") REFERENCES "receitas"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "itens_receita" ADD CONSTRAINT "itens_receita_insumoId_fkey" FOREIGN KEY ("insumoId") REFERENCES "Insumo"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "producoes_receitas" ADD CONSTRAINT "producoes_receitas_receitaId_fkey" FOREIGN KEY ("receitaId") REFERENCES "receitas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "producoes_receitas" ADD CONSTRAINT "producoes_receitas_funcionarioId_fkey" FOREIGN KEY ("funcionarioId") REFERENCES "Funcionario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;