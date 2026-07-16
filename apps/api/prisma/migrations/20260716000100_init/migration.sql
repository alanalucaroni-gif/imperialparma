-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMINISTRADOR', 'GERENTE', 'COZINHA', 'COMPRAS', 'FINANCEIRO', 'ESTOQUE');

-- CreateEnum
CREATE TYPE "MovimentacaoTipo" AS ENUM ('ENTRADA', 'SAIDA', 'AJUSTE', 'PRODUCAO');

-- CreateEnum
CREATE TYPE "ContaStatus" AS ENUM ('ABERTO', 'PAGO', 'ATRASADO', 'CANCELADO');

-- CreateEnum
CREATE TYPE "PedidoStatus" AS ENUM ('EM_PREPARO', 'SAIU_ENTREGA', 'ENTREGUE', 'CANCELADO');

-- CreateEnum
CREATE TYPE "OrdemStatus" AS ENUM ('AGUARDANDO', 'EM_PREPARO', 'CONCLUIDA', 'CANCELADA');

-- CreateEnum
CREATE TYPE "CompraStatus" AS ENUM ('PENDENTE', 'PARCIAL', 'RECEBIDO', 'CANCELADO');

-- CreateEnum
CREATE TYPE "CotacaoStatus" AS ENUM ('AGUARDANDO', 'RESPONDIDA', 'ENCERRADA', 'CANCELADA');

-- CreateEnum
CREATE TYPE "EntradaOrigem" AS ENUM ('MANUAL', 'BOLETO', 'XML', 'PEDIDO_COMPRA', 'AJUSTE');

-- CreateTable
CREATE TABLE "Usuario" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senhaHash" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'ESTOQUE',
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RefreshToken" (
    "id" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "expiraEm" TIMESTAMP(3) NOT NULL,
    "revogadoEm" TIMESTAMP(3),
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RefreshToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Insumo" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "categoria" TEXT NOT NULL,
    "unidade" TEXT NOT NULL,
    "quantidade" DECIMAL(14,3) NOT NULL DEFAULT 0,
    "estoqueMinimo" DECIMAL(14,3) NOT NULL DEFAULT 0,
    "custoUnitario" DECIMAL(14,4) NOT NULL DEFAULT 0,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Insumo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Movimentacao" (
    "id" TEXT NOT NULL,
    "insumoId" TEXT NOT NULL,
    "tipo" "MovimentacaoTipo" NOT NULL,
    "origem" "EntradaOrigem" NOT NULL,
    "quantidade" DECIMAL(14,3) NOT NULL,
    "saldoAnterior" DECIMAL(14,3) NOT NULL,
    "saldoPosterior" DECIMAL(14,3) NOT NULL,
    "custoUnitario" DECIMAL(14,4),
    "referenciaId" TEXT,
    "descricao" TEXT NOT NULL,
    "usuarioId" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Movimentacao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Fornecedor" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "cnpj" TEXT,
    "email" TEXT,
    "telefone" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Fornecedor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompraManual" (
    "id" TEXT NOT NULL,
    "insumoId" TEXT NOT NULL,
    "quantidade" DECIMAL(14,3) NOT NULL,
    "custoUnitario" DECIMAL(14,4) NOT NULL,
    "fornecedorNome" TEXT NOT NULL,
    "formaPagamento" TEXT NOT NULL,
    "observacao" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CompraManual_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EntradaBoleto" (
    "id" TEXT NOT NULL,
    "insumoId" TEXT NOT NULL,
    "quantidade" DECIMAL(14,3) NOT NULL,
    "fornecedorNome" TEXT NOT NULL,
    "linhaDigitavel" TEXT,
    "valor" DECIMAL(14,2) NOT NULL,
    "vencimento" TIMESTAMP(3) NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EntradaBoleto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NotaFiscalXml" (
    "id" TEXT NOT NULL,
    "chave" TEXT NOT NULL,
    "fornecedorNome" TEXT NOT NULL,
    "cnpj" TEXT,
    "valorTotal" DECIMAL(14,2) NOT NULL,
    "xmlOriginal" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NotaFiscalXml_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NotaFiscalItem" (
    "id" TEXT NOT NULL,
    "notaFiscalId" TEXT NOT NULL,
    "insumoId" TEXT NOT NULL,
    "codigoProduto" TEXT,
    "descricao" TEXT NOT NULL,
    "unidade" TEXT NOT NULL,
    "quantidade" DECIMAL(14,3) NOT NULL,
    "valorUnitario" DECIMAL(14,4) NOT NULL,

    CONSTRAINT "NotaFiscalItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContaPagar" (
    "id" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "fornecedorNome" TEXT,
    "valor" DECIMAL(14,2) NOT NULL,
    "vencimento" TIMESTAMP(3),
    "status" "ContaStatus" NOT NULL DEFAULT 'ABERTO',
    "linhaDigitavel" TEXT,
    "entradaBoletoId" TEXT,
    "notaFiscalId" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContaPagar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContaReceber" (
    "id" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "clienteNome" TEXT,
    "valor" DECIMAL(14,2) NOT NULL,
    "vencimento" TIMESTAMP(3),
    "status" "ContaStatus" NOT NULL DEFAULT 'ABERTO',
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContaReceber_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrdemPreparo" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "produto" TEXT NOT NULL,
    "quantidade" DECIMAL(14,3) NOT NULL,
    "unidade" TEXT NOT NULL,
    "responsavel" TEXT,
    "progresso" INTEGER NOT NULL DEFAULT 0,
    "status" "OrdemStatus" NOT NULL DEFAULT 'AGUARDANDO',
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrdemPreparo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pedido" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "clienteNome" TEXT NOT NULL,
    "endereco" TEXT,
    "formaPagamento" TEXT NOT NULL,
    "canal" TEXT NOT NULL DEFAULT 'Direto',
    "valorTotal" DECIMAL(14,2) NOT NULL,
    "status" "PedidoStatus" NOT NULL DEFAULT 'EM_PREPARO',
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Pedido_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PedidoItem" (
    "id" TEXT NOT NULL,
    "pedidoId" TEXT NOT NULL,
    "produto" TEXT NOT NULL,
    "quantidade" DECIMAL(14,3) NOT NULL,
    "valorUnitario" DECIMAL(14,2) NOT NULL,

    CONSTRAINT "PedidoItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PedidoCompra" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "fornecedorId" TEXT NOT NULL,
    "status" "CompraStatus" NOT NULL DEFAULT 'PENDENTE',
    "valorTotal" DECIMAL(14,2) NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PedidoCompra_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PedidoCompraItem" (
    "id" TEXT NOT NULL,
    "pedidoCompraId" TEXT NOT NULL,
    "insumoId" TEXT NOT NULL,
    "quantidade" DECIMAL(14,3) NOT NULL,
    "custoUnitario" DECIMAL(14,4) NOT NULL,

    CONSTRAINT "PedidoCompraItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cotacao" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "quantidade" DECIMAL(14,3) NOT NULL,
    "unidade" TEXT NOT NULL,
    "insumoCodigo" TEXT,
    "estoqueAtual" DECIMAL(14,3),
    "estoqueMinimo" DECIMAL(14,3),
    "saldoCaixa" DECIMAL(14,2),
    "status" "CotacaoStatus" NOT NULL DEFAULT 'AGUARDANDO',
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Cotacao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CotacaoFornecedor" (
    "id" TEXT NOT NULL,
    "cotacaoId" TEXT NOT NULL,
    "fornecedorId" TEXT NOT NULL,
    "precoUnitario" DECIMAL(14,4),
    "prazoDias" INTEGER,
    "frete" DECIMAL(14,2),
    "condicoes" TEXT,
    "formaPagamento" TEXT,
    "impostoIncluso" BOOLEAN,
    "origemResposta" TEXT,
    "whatsappMensagemId" TEXT,
    "enviadaEm" TIMESTAMP(3),
    "respondidaEm" TIMESTAMP(3),
    "respostaOriginal" TEXT,
    "selecionada" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "CotacaoFornecedor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CredencialIntegracao" (
    "id" TEXT NOT NULL,
    "plataforma" TEXT NOT NULL,
    "identificador" TEXT,
    "segredoCifrado" TEXT NOT NULL,
    "iv" TEXT NOT NULL,
    "authTag" TEXT NOT NULL,
    "verificadoEm" TIMESTAMP(3),
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CredencialIntegracao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WebhookWhatsapp" (
    "id" TEXT NOT NULL,
    "mensagemId" TEXT NOT NULL,
    "telefone" TEXT NOT NULL,
    "texto" TEXT,
    "payload" JSONB NOT NULL,
    "processadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WebhookWhatsapp_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- CreateIndex
CREATE UNIQUE INDEX "RefreshToken_tokenHash_key" ON "RefreshToken"("tokenHash");

-- CreateIndex
CREATE INDEX "RefreshToken_usuarioId_idx" ON "RefreshToken"("usuarioId");

-- CreateIndex
CREATE UNIQUE INDEX "Insumo_codigo_key" ON "Insumo"("codigo");

-- CreateIndex
CREATE INDEX "Insumo_nome_idx" ON "Insumo"("nome");

-- CreateIndex
CREATE INDEX "Insumo_categoria_ativo_idx" ON "Insumo"("categoria", "ativo");

-- CreateIndex
CREATE INDEX "Movimentacao_insumoId_criadoEm_idx" ON "Movimentacao"("insumoId", "criadoEm");

-- CreateIndex
CREATE INDEX "Movimentacao_origem_referenciaId_idx" ON "Movimentacao"("origem", "referenciaId");

-- CreateIndex
CREATE UNIQUE INDEX "Fornecedor_cnpj_key" ON "Fornecedor"("cnpj");

-- CreateIndex
CREATE UNIQUE INDEX "NotaFiscalXml_chave_key" ON "NotaFiscalXml"("chave");

-- CreateIndex
CREATE INDEX "NotaFiscalItem_notaFiscalId_idx" ON "NotaFiscalItem"("notaFiscalId");

-- CreateIndex
CREATE UNIQUE INDEX "ContaPagar_entradaBoletoId_key" ON "ContaPagar"("entradaBoletoId");

-- CreateIndex
CREATE INDEX "ContaPagar_status_vencimento_idx" ON "ContaPagar"("status", "vencimento");

-- CreateIndex
CREATE UNIQUE INDEX "OrdemPreparo_codigo_key" ON "OrdemPreparo"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "Pedido_codigo_key" ON "Pedido"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "PedidoCompra_codigo_key" ON "PedidoCompra"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "Cotacao_codigo_key" ON "Cotacao"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "CotacaoFornecedor_whatsappMensagemId_key" ON "CotacaoFornecedor"("whatsappMensagemId");

-- CreateIndex
CREATE UNIQUE INDEX "CotacaoFornecedor_cotacaoId_fornecedorId_key" ON "CotacaoFornecedor"("cotacaoId", "fornecedorId");

-- CreateIndex
CREATE UNIQUE INDEX "CredencialIntegracao_plataforma_key" ON "CredencialIntegracao"("plataforma");

-- CreateIndex
CREATE UNIQUE INDEX "WebhookWhatsapp_mensagemId_key" ON "WebhookWhatsapp"("mensagemId");

-- AddForeignKey
ALTER TABLE "RefreshToken" ADD CONSTRAINT "RefreshToken_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Movimentacao" ADD CONSTRAINT "Movimentacao_insumoId_fkey" FOREIGN KEY ("insumoId") REFERENCES "Insumo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompraManual" ADD CONSTRAINT "CompraManual_insumoId_fkey" FOREIGN KEY ("insumoId") REFERENCES "Insumo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EntradaBoleto" ADD CONSTRAINT "EntradaBoleto_insumoId_fkey" FOREIGN KEY ("insumoId") REFERENCES "Insumo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotaFiscalItem" ADD CONSTRAINT "NotaFiscalItem_notaFiscalId_fkey" FOREIGN KEY ("notaFiscalId") REFERENCES "NotaFiscalXml"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotaFiscalItem" ADD CONSTRAINT "NotaFiscalItem_insumoId_fkey" FOREIGN KEY ("insumoId") REFERENCES "Insumo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContaPagar" ADD CONSTRAINT "ContaPagar_entradaBoletoId_fkey" FOREIGN KEY ("entradaBoletoId") REFERENCES "EntradaBoleto"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContaPagar" ADD CONSTRAINT "ContaPagar_notaFiscalId_fkey" FOREIGN KEY ("notaFiscalId") REFERENCES "NotaFiscalXml"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PedidoItem" ADD CONSTRAINT "PedidoItem_pedidoId_fkey" FOREIGN KEY ("pedidoId") REFERENCES "Pedido"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PedidoCompra" ADD CONSTRAINT "PedidoCompra_fornecedorId_fkey" FOREIGN KEY ("fornecedorId") REFERENCES "Fornecedor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PedidoCompraItem" ADD CONSTRAINT "PedidoCompraItem_pedidoCompraId_fkey" FOREIGN KEY ("pedidoCompraId") REFERENCES "PedidoCompra"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PedidoCompraItem" ADD CONSTRAINT "PedidoCompraItem_insumoId_fkey" FOREIGN KEY ("insumoId") REFERENCES "Insumo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CotacaoFornecedor" ADD CONSTRAINT "CotacaoFornecedor_cotacaoId_fkey" FOREIGN KEY ("cotacaoId") REFERENCES "Cotacao"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CotacaoFornecedor" ADD CONSTRAINT "CotacaoFornecedor_fornecedorId_fkey" FOREIGN KEY ("fornecedorId") REFERENCES "Fornecedor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
