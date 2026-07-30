ALTER TYPE "EntradaOrigem" ADD VALUE IF NOT EXISTS 'VENDA';

ALTER TABLE "Pedido" ADD COLUMN "idExterno" TEXT;
CREATE UNIQUE INDEX "Pedido_idExterno_key" ON "Pedido"("idExterno");

CREATE TABLE "ifood_eventos" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "pedidoIdExterno" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDENTE',
    "tentativas" INTEGER NOT NULL DEFAULT 0,
    "erro" TEXT,
    "processadoEm" TIMESTAMP(3),
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ifood_eventos_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ifood_eventos_status_criadoEm_idx" ON "ifood_eventos"("status", "criadoEm");
CREATE INDEX "ifood_eventos_pedidoIdExterno_idx" ON "ifood_eventos"("pedidoIdExterno");
