---
name: monorepo-conventions
description: Use when reasoning about the monorepo structure, package boundaries, or where new code belongs. The architecture of the starter skeleton.
---

# Monorepo Conventions

This is a pnpm + Turborepo monorepo. Code is split into apps (deployable) and packages (shared).

## Apps (deployable processes)
- `apps/web` — Next.js app. Uses `@project/db`, `@project/services`, `@project/domain`, `@project/auth`, `@project/log`.
- `apps/worker` — background worker. Uses `@project/db`, `@project/services`, `@project/log`. Does NOT use `@project/domain` or `@project/auth` (today).
- `apps/db-server` — dev-only Postgres host. Uses `@project/db`, `@project/log`. Replaced by Azure Postgres in production.
- `apps/migrate` — migration CLI + seed. Uses `@project/db`.

## Packages (shared libraries)
- `@project/db` — Prisma schema, migrations, generated client, `applyMigrations`. Imported by all apps.
- `@project/services` — Azure adapters (queue, storage, notify). Imported by web and worker.
- `@project/domain` — Zod schemas and queries. Web-only.
- `@project/auth` — `currentUserId()` dev stub; web-only today. Replaced with real auth in Week 8.
- `@project/log` — pino wrapper. Imported by all packages and apps.

## Rules
- Apps never import from other apps.
- Packages depend on each other via `workspace:*` only.
- The Prisma client is imported from `@project/db` only — never from `@prisma/client` directly.
- The `@project` scope is a placeholder; users replace it via search-and-replace across all `package.json` files and import statements.

## Replace @project
When asked to set the scope: search-replace `@project` → `<user-chosen-scope>` across all `package.json` files and import statements.