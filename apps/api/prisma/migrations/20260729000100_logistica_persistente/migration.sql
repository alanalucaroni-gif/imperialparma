CREATE TYPE "LogisticaPedidoStatus" AS ENUM (
  'AGUARDANDO',
  'EM_PREPARO',
  'PRONTO',
  'COLETA',
  'EM_ROTA',
  'ENTREGUE',
  'PROBLEMA',
  'CANCELADO',
  'RETORNANDO'
);

CREATE TYPE "LogisticaOcorrenciaStatus" AS ENUM ('ABERTA', 'RESOLVIDA');

CREATE TABLE "LogisticaConfiguracao" (
  "id" TEXT NOT NULL DEFAULT 'principal',
  "enderecoOrigem" TEXT NOT NULL,
  "tipoCalculoDistancia" TEXT NOT NULL DEFAULT 'ida',
  "valorKm" DECIMAL(14,4) NOT NULL DEFAULT 2.5,
  "valorMinimo" DECIMAL(14,2) NOT NULL DEFAULT 8,
  "raioMaximoKm" DECIMAL(10,2) NOT NULL DEFAULT 12,
  "atualizadoPorUsuarioId" TEXT,
  "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "atualizadoEm" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "LogisticaConfiguracao_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "LogisticaEntregador" (
  "id" TEXT NOT NULL,
  "codigoExterno" TEXT,
  "nome" TEXT NOT NULL,
  "telefone" TEXT,
  "empresa" TEXT NOT NULL,
  "ativo" BOOLEAN NOT NULL DEFAULT true,
  "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "atualizadoEm" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "LogisticaEntregador_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "LogisticaPedido" (
  "id" TEXT NOT NULL,
  "idLegado" TEXT,
  "idExterno" TEXT,
  "codigoPedido" TEXT NOT NULL,
  "clienteNome" TEXT NOT NULL,
  "clienteTelefone" TEXT,
  "endereco" TEXT NOT NULL,
  "complemento" TEXT,
  "referencia" TEXT,
  "bairro" TEXT NOT NULL,
  "canal" TEXT NOT NULL DEFAULT 'Direto',
  "formaPagamento" TEXT NOT NULL DEFAULT 'PIX',
  "valorPedido" DECIMAL(14,2) NOT NULL DEFAULT 0,
  "taxaEntregaCliente" DECIMAL(14,2) NOT NULL DEFAULT 0,
  "distanciaKm" DECIMAL(10,2) NOT NULL,
  "distanciaCobradaKm" DECIMAL(10,2),
  "duracaoEstimadaMinutos" INTEGER,
  "enderecoOrigem" TEXT NOT NULL,
  "tipoCalculoDistancia" TEXT NOT NULL DEFAULT 'ida',
  "origemDistancia" TEXT NOT NULL DEFAULT 'MANUAL',
  "rotaCalculada" JSONB,
  "custoEstimado" DECIMAL(14,2) NOT NULL DEFAULT 0,
  "custoReal" DECIMAL(14,2),
  "origemValor" TEXT,
  "tabelaEmpresa" TEXT,
  "observacoes" TEXT,
  "origem" TEXT NOT NULL DEFAULT 'MANUAL',
  "status" "LogisticaPedidoStatus" NOT NULL DEFAULT 'AGUARDANDO',
  "entregadorId" TEXT,
  "atribuidoEm" TIMESTAMP(3),
  "coletadoEm" TIMESTAMP(3),
  "saiuEntregaEm" TIMESTAMP(3),
  "entregueEm" TIMESTAMP(3),
  "canceladoEm" TIMESTAMP(3),
  "criadoPorUsuarioId" TEXT,
  "atualizadoPorUsuarioId" TEXT,
  "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "atualizadoEm" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "LogisticaPedido_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "LogisticaPedidoEtapa" (
  "id" TEXT NOT NULL,
  "pedidoId" TEXT NOT NULL,
  "status" "LogisticaPedidoStatus" NOT NULL,
  "descricao" TEXT,
  "dados" JSONB,
  "usuarioId" TEXT,
  "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "LogisticaPedidoEtapa_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "LogisticaOcorrencia" (
  "id" TEXT NOT NULL,
  "pedidoId" TEXT NOT NULL,
  "tipo" TEXT NOT NULL DEFAULT 'OPERACIONAL',
  "descricao" TEXT NOT NULL,
  "status" "LogisticaOcorrenciaStatus" NOT NULL DEFAULT 'ABERTA',
  "resolucao" TEXT,
  "abertaPorUsuarioId" TEXT,
  "resolvidaPorUsuarioId" TEXT,
  "resolvidaEm" TIMESTAMP(3),
  "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "atualizadoEm" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "LogisticaOcorrencia_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "LogisticaLocalizacao" (
  "id" TEXT NOT NULL,
  "entregadorId" TEXT NOT NULL,
  "pedidoId" TEXT,
  "latitude" DECIMAL(10,7) NOT NULL,
  "longitude" DECIMAL(10,7) NOT NULL,
  "precisaoMetros" DOUBLE PRECISION,
  "velocidadeKmh" DOUBLE PRECISION,
  "direcaoGraus" DOUBLE PRECISION,
  "registradoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "LogisticaLocalizacao_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "LogisticaEntregador_codigoExterno_key" ON "LogisticaEntregador"("codigoExterno");
CREATE INDEX "LogisticaEntregador_empresa_ativo_idx" ON "LogisticaEntregador"("empresa", "ativo");
CREATE INDEX "LogisticaEntregador_nome_idx" ON "LogisticaEntregador"("nome");

CREATE UNIQUE INDEX "LogisticaPedido_idLegado_key" ON "LogisticaPedido"("idLegado");
CREATE UNIQUE INDEX "LogisticaPedido_canal_idExterno_key" ON "LogisticaPedido"("canal", "idExterno");
CREATE INDEX "LogisticaPedido_status_atualizadoEm_idx" ON "LogisticaPedido"("status", "atualizadoEm");
CREATE INDEX "LogisticaPedido_codigoPedido_idx" ON "LogisticaPedido"("codigoPedido");
CREATE INDEX "LogisticaPedido_bairro_criadoEm_idx" ON "LogisticaPedido"("bairro", "criadoEm");
CREATE INDEX "LogisticaPedido_entregadorId_status_idx" ON "LogisticaPedido"("entregadorId", "status");

CREATE INDEX "LogisticaPedidoEtapa_pedidoId_criadoEm_idx" ON "LogisticaPedidoEtapa"("pedidoId", "criadoEm");
CREATE INDEX "LogisticaOcorrencia_pedidoId_status_criadoEm_idx" ON "LogisticaOcorrencia"("pedidoId", "status", "criadoEm");
CREATE INDEX "LogisticaLocalizacao_entregadorId_registradoEm_idx" ON "LogisticaLocalizacao"("entregadorId", "registradoEm");
CREATE INDEX "LogisticaLocalizacao_pedidoId_registradoEm_idx" ON "LogisticaLocalizacao"("pedidoId", "registradoEm");

ALTER TABLE "LogisticaPedido"
  ADD CONSTRAINT "LogisticaPedido_entregadorId_fkey"
  FOREIGN KEY ("entregadorId") REFERENCES "LogisticaEntregador"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "LogisticaPedidoEtapa"
  ADD CONSTRAINT "LogisticaPedidoEtapa_pedidoId_fkey"
  FOREIGN KEY ("pedidoId") REFERENCES "LogisticaPedido"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "LogisticaOcorrencia"
  ADD CONSTRAINT "LogisticaOcorrencia_pedidoId_fkey"
  FOREIGN KEY ("pedidoId") REFERENCES "LogisticaPedido"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "LogisticaLocalizacao"
  ADD CONSTRAINT "LogisticaLocalizacao_entregadorId_fkey"
  FOREIGN KEY ("entregadorId") REFERENCES "LogisticaEntregador"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "LogisticaLocalizacao"
  ADD CONSTRAINT "LogisticaLocalizacao_pedidoId_fkey"
  FOREIGN KEY ("pedidoId") REFERENCES "LogisticaPedido"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
