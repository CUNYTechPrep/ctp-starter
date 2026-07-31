// The Prisma client. One client per process, cached in a global to survive
// hot reloads. Three doors: PGlite (tests), local Postgres (dev), Azure (prod).

import { PrismaClient } from "./generated/prisma";

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

export const LOCAL_DEV_URL = "postgresql://postgres:postgres@127.0.0.1:5433/postgres";

async function makeClient(): Promise<PrismaClient> {
  if (process.env.PGLITE_DATA_DIR) {
    // Test door: embedded engine, no server.
    const { PGlite } = await import("@electric-sql/pglite");
    const { PrismaPGlite } = await import("pglite-prisma-adapter");
    const { applyMigrations } = await import("./apply-migrations");
    const pglite = new PGlite(process.env.PGLITE_DATA_DIR);
    await applyMigrations(pglite as unknown as Parameters<typeof applyMigrations>[0]);
    return new PrismaClient({ adapter: new PrismaPGlite(pglite) });
  }

  // Dev + prod door: a real server over the wire.
  const { PrismaPg } = await import("@prisma/adapter-pg");
  const { Pool } = await import("pg");
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL ?? LOCAL_DEV_URL,
    max: Number(process.env.PG_POOL_MAX ?? Number(process.env.DATABASE_URL ? 1 : 5)),
  });
  return new PrismaClient({ adapter: new PrismaPg(pool) });
}

// Next.js hot-reloads modules in dev; the global stops us opening a new
// client on every save. (Top-level await is fine in server modules.)
export const prisma = globalThis.__prisma ?? (await makeClient());
if (process.env.NODE_ENV !== "production") globalThis.__prisma = prisma;