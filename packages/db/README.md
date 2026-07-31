# @project/db — Prisma schema, client, and migration runner

The database seam. Owns the Prisma schema, the generated client, the migration
files, and the `applyMigrations` helper. Every app and most other packages
import from here.

**Boilerplate:** the schema is empty (generator + datasource only). Example
branches add their own models, enums, and migration files.

## Public API

All exports come from `src/index.ts` (`@project/db`):

| Export | What it is |
|---|---|
| `prisma` | The singleton PrismaClient. One per process — cached in a global to survive hot reloads. |
| `LOCAL_DEV_URL` | The default dev database URL (`postgresql://postgres:postgres@127.0.0.1:5433/postgres`). |

The migration runner is available at a separate export to keep it out of the
web bundle (web apps never run migrations):

```
import { applyMigrations } from "@project/db/migrate";
```

## Three doors, one client

The Prisma client connects through three different doors depending on the
environment:

| Door | When | How |
|---|---|---|
| PGlite (in-process) | Tests (`PGLITE_DATA_DIR` set) | Postgres-in-WebAssembly, in memory, no server needed |
| Local Postgres | Local dev (no env vars) | Your own server on `127.0.0.1:5433`, started by `apps/db-server/` |
| Azure Postgres | Production (`DATABASE_URL` set) | Azure Database for PostgreSQL over the wire |

## Dependencies

- `@project/log` — for logging (used by `applyMigrations`)
- `@prisma/client` — the Prisma runtime, required directly by `@project/db` and as a peer dep of `pglite-prisma-adapter`
- `@prisma/adapter-pg` — the driver adapter for the pg pool
- `@electric-sql/pglite` — Postgres-in-WASM (used in test door only)
- `pglite-prisma-adapter` — adapter bridging PGlite to Prisma
- `pg` — the PostgreSQL client driver

## Consumers

- `apps/web` — via `@project/db`
- `apps/worker` — via `@project/db`
- `apps/db-server` — via `@project/db/migrate` (for `applyMigrations`)
- `apps/migrate` — via `@project/db/migrate` (for `applyMigrations`)
- `packages/domain` — via `@project/db`

## Generating the client

```bash
pnpm prisma:generate
```

The generated client output goes to `src/generated/prisma/` (controlled by the
`output` field in `prisma/schema.prisma`). This directory is gitignored and
regenerated on install.

## Adding a migration

1. Edit `prisma/schema.prisma`.
2. Run `prisma migrate dev --create-only` from this directory.
3. Review the generated SQL in `prisma/migrations/`.
4. Run `pnpm prisma:generate` to update the client types.