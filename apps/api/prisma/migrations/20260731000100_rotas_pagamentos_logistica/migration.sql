CREATE TYPE "LogisticaOrdemPagamentoStatus" AS ENUM ('PENDENTE', 'PAGA', 'CANCELADA');

ALTER TABLE "LogisticaPedido"
ADD COLUMN "rotaId" TEXT,
ADD COLUMN "ordemNaRota" INTEGER,
ADD COLUMN "linkEntregadorEnviadoEm" TIMESTAMP(3),
ADD COLUMN "linkClienteEnviadoEm" TIMESTAMP(3),
ADD COLUMN "falhaEnvioEntregador" TEXT,
ADD COLUMN "falhaEnvioCliente" TEXT;

CREATE TABLE "LogisticaOrdemPagamento" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "entregadorId" TEXT NOT NULL,
    "dataReferencia" DATE NOT NULL,
    "quantidadeCorridas" INTEGER NOT NULL,
    "total" DECIMAL(14,2) NOT NULL,
    "totalTaxasCliente" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "status" "LogisticaOrdemPagamentoStatus" NOT NULL DEFAULT 'PENDENTE',
    "geradaPorUsuarioId" TEXT,
    "pagaPorUsuarioId" TEXT,
    "pagaEm" TIMESTAMP(3),
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "LogisticaOrdemPagamento_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "LogisticaOrdemPagamentoItem" (
    "id" TEXT NOT NULL,
    "ordemPagamentoId" TEXT NOT NULL,
    "pedidoId" TEXT NOT NULL,
    "valorCorrida" DECIMAL(14,2) NOT NULL,
    "taxaCliente" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "LogisticaOrdemPagamentoItem_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "LogisticaOrdemPagamento_codigo_key"
ON "LogisticaOrdemPagamento"("codigo");

CREATE UNIQUE INDEX "LogisticaOrdemPagamento_entregadorId_dataReferencia_key"
ON "LogisticaOrdemPagamento"("entregadorId", "dataReferencia");

CREATE INDEX "LogisticaOrdemPagamento_status_dataReferencia_idx"
ON "LogisticaOrdemPagamento"("status", "dataReferencia");

CREATE UNIQUE INDEX "LogisticaOrdemPagamentoItem_pedidoId_key"
ON "LogisticaOrdemPagamentoItem"("pedidoId");

CREATE INDEX "LogisticaOrdemPagamentoItem_ordemPagamentoId_idx"
ON "LogisticaOrdemPagamentoItem"("ordemPagamentoId");

CREATE INDEX "LogisticaPedido_rotaId_ordemNaRota_idx"
ON "LogisticaPedido"("rotaId", "ordemNaRota");

ALTER TABLE "LogisticaOrdemPagamento"
ADD CONSTRAINT "LogisticaOrdemPagamento_entregadorId_fkey"
FOREIGN KEY ("entregadorId") REFERENCES "LogisticaEntregador"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "LogisticaOrdemPagamentoItem"
ADD CONSTRAINT "LogisticaOrdemPagamentoItem_ordemPagamentoId_fkey"
FOREIGN KEY ("ordemPagamentoId") REFERENCES "LogisticaOrdemPagamento"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "LogisticaOrdemPagamentoItem"
ADD CONSTRAINT "LogisticaOrdemPagamentoItem_pedidoId_fkey"
FOREIGN KEY ("pedidoId") REFERENCES "LogisticaPedido"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;
