// Dev-only PostgreSQL server. Starts a real Postgres process, owns the .pgdata/
// directory, and auto-applies migrations on boot. Replaced by Azure Postgres in
// production (Week 10) — same Prisma client, different DATABASE_URL.

import EmbeddedPostgres from "embedded-postgres";
import { Client } from "pg";
import { applyMigrations } from "@project/db/migrate";
import { log } from "@project/log";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const PORT = Number(process.env.DB_PORT ?? 5433);
const DATA_DIR = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..", "..", ".pgdata");

async function main() {
  const pg = new EmbeddedPostgres({
    databaseDir: DATA_DIR,
    user: "postgres",
    password: "postgres",
    port: PORT,
    persistent: true,
  });

  if (!existsSync(DATA_DIR)) {
    log.info({ dataDir: DATA_DIR }, "first run — initializing database cluster");
    await pg.initialise();
  }
  await pg.start();

  const client = new Client({
    host: "127.0.0.1",
    port: PORT,
    user: "postgres",
    password: "postgres",
    database: "postgres",
  });
  await client.connect();
  await applyMigrations(
    {
      exec: async (sql) => void (await client.query(sql)),
      query: async (sql, params) => client.query(sql, params),
    },
    (msg) => log.info(msg)
  );
  await client.end();

  log.info(
    { port: PORT, dataDir: DATA_DIR },
    "postgres ready — this process owns the data; everything else (web, worker, psql) connects as a client"
  );

  const stop = async () => {
    log.info("stopping postgres…");
    await pg.stop();
    process.exit(0);
  };
  process.on("SIGINT", stop);
  process.on("SIGTERM", stop);
}

main().catch((err) => {
  log.error({ err: String(err) }, "db server failed — port in use? another `pnpm dev` running?");
  process.exit(1);
});