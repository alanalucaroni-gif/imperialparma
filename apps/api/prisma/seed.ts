import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { hash } from "bcryptjs";
import { PrismaClient } from "../src/generated/prisma/client.js";
import { Role } from "../src/generated/prisma/enums.js";
import { inventarioInicial } from "./inventario.js";
import { receitasIniciais } from "./receitas-iniciais.js";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL não configurada.");
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

const codigosDemonstracao = ["CN-1001", "CN-2044", "LT-3310", "SC-1187", "MH-0552", "EM-0771"];

async function main() {
  const adminEmail = (process.env.ADMIN_EMAIL || "admin@imperial.local").toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD || "Imperial@123";
  const adminName = process.env.ADMIN_NAME || "Administrador Imperial";
  // Permitir fallback para Imperial@123 em producao se nao configurado


  await prisma.usuario.upsert({
    where: { email: adminEmail },
    update: { nome: adminName, senhaHash: await hash(adminPassword, 12), role: Role.ADMINISTRADOR },
    create: { nome: adminName, email: adminEmail, senhaHash: await hash(adminPassword, 12), role: Role.ADMINISTRADOR },
  });
  await prisma.insumo.updateMany({ where: { codigo: { in: codigosDemonstracao } }, data: { ativo: false } });
  for (const [codigo, nome, categoria, unidade, quantidade, estoqueMinimo] of inventarioInicial) {
    await prisma.insumo.upsert({
      where: { codigo }, update: { nome, categoria, unidade, quantidade, estoqueMinimo, ativo: true },
      create: { codigo, nome, categoria, unidade, quantidade, estoqueMinimo, custoUnitario: 0 },
    });
  }
  // Mantem as receitas historicas disponiveis no cadastro persistente e na Cozinha.
  const produtosFinais = new Map(receitasIniciais.map(receita => [receita.produtoCod, receita]));
  for (const receita of produtosFinais.values()) {
    await prisma.insumo.upsert({
      where: { codigo: receita.produtoCod },
      update: {},
      create: {
        codigo: receita.produtoCod,
        nome: receita.produto,
        categoria: receita.categoria,
        unidade: receita.un,
        quantidade: 0,
        estoqueMinimo: 0,
        custoUnitario: 0,
      },
    });
  }

  const codigosProducao = [...new Set(receitasIniciais.flatMap(receita => [
    receita.produtoCod,
    ...receita.insumos.map(item => item.cod),
  ]))];
  const insumosProducao = await prisma.insumo.findMany({
    where: { codigo: { in: codigosProducao } },
    select: { id: true, codigo: true },
  });
  const insumosPorCodigo = new Map(insumosProducao.map(item => [item.codigo, item]));

  for (const receita of receitasIniciais) {
    const produtoFinal = insumosPorCodigo.get(receita.produtoCod);
    if (!produtoFinal) throw new Error("Produto final nao encontrado no estoque: " + receita.produtoCod);
    const itens = receita.insumos.map(item => {
      const insumo = insumosPorCodigo.get(item.cod);
      if (!insumo) throw new Error("Insumo nao encontrado no estoque: " + item.cod);
      return {
        insumoId: insumo.id,
        nome: item.nome,
        quantidade: item.qtd,
        unidade: item.un,
      };
    });
    await prisma.receita.upsert({
      where: { codigo: receita.id },
      update: {},
      create: {
        codigo: receita.id,
        nome: receita.produto,
        categoria: receita.categoria,
        rendimento: receita.rendimento,
        unidadeRendimento: receita.un,
        setorPadrao: "Cozinha / Preparo",
        instrucoesProducao: "Executar conforme a ficha tecnica de producao cadastrada.",
        observacoes: "Importada do cadastro historico " + receita.codigoReceita + ".",
        produtoFinalId: produtoFinal.id,
        ativo: true,
        itens: { create: itens },
      },
    });
  }

  console.log("Seed concluído: administrador e inventário atualizado.");
}

main().finally(() => prisma.$disconnect());
