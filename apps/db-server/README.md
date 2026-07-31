# @project/db-server — the dev-only Postgres host

Starts a real PostgreSQL server as a child process. Exists only in development.
In production it's replaced by setting `DATABASE_URL` to an Azure Postgres
instance (Week 10).

## What it does

- Boots an embedded Postgres from `embedded-postgres` (a native npm package)
- Owns the `.pgdata/` data directory at the repo root
- Auto-applies any pending migrations on startup via `@project/db`'s `applyMigrations`
- Listens on port 5433 by default (configurable via `DB_PORT`)
- Traps SIGINT/SIGTERM to shut down cleanly

## Dependencies

- `@project/db` — `applyMigrations` for auto-migration on boot
- `@project/log` — pino logger
- `embedded-postgres` — the native Postgres package npm installs for you
- `pg` — the PostgreSQL client driver

## Consumers

Only developers running the app locally. No code imports from `@project/db-server`
— it's a standalone entry point.

## Local dev

```bash
pnpm db:dev      # starts the Postgres server in the foreground
```

This runs automatically via `pnpm dev` from the repo root.

## In production

This entire app is deleted. Azure Database for PostgreSQL replaces it.
The same Prisma client (`@project/db`) connects to Azure via `DATABASE_URL`
— no code changes needed.