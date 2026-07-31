// Applies pending SQL migrations against any DATABASE_URL. Used by CI.
// The dev server also auto-applies on boot, so local dev rarely needs this.

import { Client } from "pg";
import { applyMigrations } from "@project/db/migrate";

const url =
  process.env.DATABASE_URL ?? "postgresql://postgres:postgres@127.0.0.1:5433/postgres";

async function main() {
  const client = new Client({ connectionString: url });
  await client.connect().catch(() => {
    console.error(`Could not reach ${url.replace(/:[^:@/]+@/, ":***@")}`);
    console.error("Is the dev server running? (`pnpm dev` starts the local database.)");
    process.exit(1);
  });
  await applyMigrations(
    {
      exec: async (sql) => void (await client.query(sql)),
      query: async (sql, params) => client.query(sql, params),
    },
    console.log
  );
  await client.end();
  console.log("done");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});