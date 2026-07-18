import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { hash } from "bcryptjs";
import { PrismaClient } from "../src/generated/prisma/client.js";
import { Role } from "../src/generated/prisma/enums.js";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL não configurada.");
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

const insumos = [
  ["CN-1001", "Filé de Frango", "Carnes", "kg", 62, 30, 18.9],
  ["CN-2044", "Contra-filé Bovino", "Carnes", "kg", 18, 25, 34.5],
  ["LT-3310", "Queijo Muçarela", "Laticínios", "kg", 4.2, 20, 32],
  ["SC-1187", "Farinha de Rosca", "Secos", "kg", 3, 15, 6.8],
  ["MH-0552", "Molho de Tomate Artesanal", "Molhos", "L", 38, 15, 5.4],
  ["EM-0771", "Embalagem Marmita 500ml", "Embalagens", "un", 140, 600, 0.78],
] as const;

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
  for (const [codigo, nome, categoria, unidade, quantidade, estoqueMinimo, custoUnitario] of insumos) {
    await prisma.insumo.upsert({
      where: { codigo }, update: { nome, categoria, unidade, estoqueMinimo, custoUnitario },
      create: { codigo, nome, categoria, unidade, quantidade, estoqueMinimo, custoUnitario },
    });
  }
  console.log("Seed concluído: administrador e insumos iniciais criados.");
}

main().finally(() => prisma.$disconnect());
