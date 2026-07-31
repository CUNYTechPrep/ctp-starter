// Applies SQL migration files in order via a generic query interface.
// Works with both PGlite (in-process, tests) and pg (server, dev+prod).

import { log } from "@project/log";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

interface Sql {
  exec(sql: string): Promise<void>;
  query(sql: string, params?: unknown[]): Promise<{ rows: unknown[] }>;
}

const MIGRATIONS_DIR = join(dirname(fileURLToPath(import.meta.url)), "..", "prisma", "migrations");

export async function applyMigrations(sql: Sql, info = (msg: string) => {}) {
  // Ensure migrations table exists.
  await sql.exec(`
    CREATE TABLE IF NOT EXISTS _migrations (
      name TEXT PRIMARY KEY,
      applied_at TIMESTAMPTZ DEFAULT now()
    )
  `);

  const { readdir } = await import("node:fs/promises");
  let files: string[];
  try {
    files = await readdir(MIGRATIONS_DIR);
  } catch {
    info("no migrations directory — skipping");
    return;
  }

  const sorted = files.filter((f) => f.endsWith(".sql")).sort();
  const { rows } = await sql.query("SELECT name FROM _migrations ORDER BY name");
  const applied = new Set(rows.map((r: unknown) => (r as { name: string }).name));

  for (const file of sorted) {
    if (applied.has(file)) {
      info(`migration ${file} already applied — skipping`);
      continue;
    }
    const { readFile } = await import("node:fs/promises");
    const migration = await readFile(join(MIGRATIONS_DIR, file), "utf-8");
    await sql.exec(migration);
    await sql.exec(`INSERT INTO _migrations (name) VALUES ('${file.replace(/'/g, "''")}')`);
    info(`applied migration ${file}`);
  }
}