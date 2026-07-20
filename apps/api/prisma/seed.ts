import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { hash } from "bcryptjs";
import { PrismaClient } from "../src/generated/prisma/client.js";
import { Role } from "../src/generated/prisma/enums.js";
import { inventarioInicial } from "./inventario.js";

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
  for (const [codigo, nome, categoria, unidade, quantidade] of inventarioInicial) {
    await prisma.insumo.upsert({
      where: { codigo }, update: { nome, categoria, unidade, quantidade, ativo: true },
      create: { codigo, nome, categoria, unidade, quantidade, estoqueMinimo: 0, custoUnitario: 0 },
    });
  }
  console.log("Seed concluído: administrador e inventário atualizado.");
}

main().finally(() => prisma.$disconnect());
