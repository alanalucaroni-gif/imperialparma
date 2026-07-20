import { spawnSync } from "node:child_process";
import pg from "pg";

const recoverableMigrations = [
  "20260720000400_vincular_produto_final_estoque",
];

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL nao configurada para reparar migracoes.");
}

const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
await client.connect();

let failedMigrations = [];
try {
  const result = await client.query(
    `SELECT migration_name
       FROM "_prisma_migrations"
      WHERE migration_name = ANY($1::text[])
        AND finished_at IS NULL
        AND rolled_back_at IS NULL`,
    [recoverableMigrations],
  );
  failedMigrations = result.rows.map((row) => row.migration_name);
} catch (error) {
  if (error?.code !== "42P01") {
    throw error;
  }
} finally {
  await client.end();
}

for (const migrationName of failedMigrations) {
  console.log(`Reparando migracao interrompida: ${migrationName}`);
  const command = process.platform === "win32" ? "npx.cmd" : "npx";
  const result = spawnSync(
    command,
    ["prisma", "migrate", "resolve", "--rolled-back", migrationName],
    { cwd: new URL("..", import.meta.url), stdio: "inherit" },
  );

  if (result.status !== 0) {
    throw new Error(`Nao foi possivel reparar a migracao ${migrationName}.`);
  }
}

if (failedMigrations.length === 0) {
  console.log("Nenhuma migracao interrompida precisa de reparo.");
}
