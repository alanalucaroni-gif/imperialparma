-- Perfis adicionais mantêm COZINHA por compatibilidade com os dados já existentes.
ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'PRODUCAO';
ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'CAIXA';
ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'ATENDENTE';
ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'PERSONALIZADO';

CREATE TABLE "Funcionario" (
    "id" TEXT NOT NULL,
    "codigo" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "cpf" TEXT,
    "rg" TEXT,
    "dataNascimento" TIMESTAMP(3),
    "dataAdmissao" TIMESTAMP(3),
    "cargo" TEXT NOT NULL,
    "setor" TEXT NOT NULL,
    "telefone" TEXT,
    "email" TEXT,
    "endereco" TEXT,
    "salario" DECIMAL(14,2),
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "observacoes" TEXT,
    "fotoUrl" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Funcionario_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "Usuario"
  ADD COLUMN "login" TEXT,
  ADD COLUMN "permissoes" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN "funcionarioId" TEXT,
  ADD COLUMN "ultimoAcesso" TIMESTAMP(3);

-- Usuários anteriores continuam podendo entrar com o e-mail, agora também usado como login inicial único.
UPDATE "Usuario" SET "login" = lower("email") WHERE "login" IS NULL;

ALTER TABLE "Fornecedor"
  ADD COLUMN "razaoSocial" TEXT,
  ADD COLUMN "nomeFantasia" TEXT,
  ADD COLUMN "inscricaoEstadual" TEXT,
  ADD COLUMN "whatsapp" TEXT,
  ADD COLUMN "site" TEXT,
  ADD COLUMN "cidade" TEXT,
  ADD COLUMN "estado" TEXT,
  ADD COLUMN "cep" TEXT,
  ADD COLUMN "contatoPrincipal" TEXT,
  ADD COLUMN "categoria" TEXT,
  ADD COLUMN "formaPagamento" TEXT,
  ADD COLUMN "prazoPagamento" INTEGER;

CREATE UNIQUE INDEX "Funcionario_codigo_key" ON "Funcionario"("codigo");
CREATE UNIQUE INDEX "Funcionario_cpf_key" ON "Funcionario"("cpf");
CREATE INDEX "Funcionario_nome_idx" ON "Funcionario"("nome");
CREATE INDEX "Funcionario_setor_cargo_ativo_idx" ON "Funcionario"("setor", "cargo", "ativo");
CREATE UNIQUE INDEX "Usuario_login_key" ON "Usuario"("login");
CREATE UNIQUE INDEX "Usuario_funcionarioId_key" ON "Usuario"("funcionarioId");

ALTER TABLE "Usuario" ADD CONSTRAINT "Usuario_funcionarioId_fkey"
  FOREIGN KEY ("funcionarioId") REFERENCES "Funcionario"("id") ON DELETE SET NULL ON UPDATE CASCADE;