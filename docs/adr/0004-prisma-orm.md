# ADR-0004: Prisma as ORM

## Status

Accepted

## Context

The project needed a database access layer that could serve both the web app
and the background worker, with schema migrations, type-safe queries, and the
ability to switch between local Postgres (dev) and Azure Postgres (prod).

## Decision

Use Prisma as the ORM and migration tool.

- Prisma's `prisma generate` produces a fully typed client. Queries are
  type-checked at compile time — a removed column in `schema.prisma` causes
  every broken query to be a TypeScript error, not a runtime crash.
- Schema-first: the Prisma schema is the single source of truth for the data
  model. Migrations are SQL files checked into the repo.
- Where Prisma's query API is insufficient (e.g., `SELECT pg_notify(...)`),
  raw queries via `$executeRaw` are used inside transactions.

## Consequences

- **Easier**: type-safe queries reduce runtime surprises; schema migrations are
  version-controlled SQL; the generated client is a single import away.
- **Harder**: Prisma adds a `prisma generate` step to the build; raw SQL queries
  bypass the type safety.
- **Accepted tradeoff**: Prisma's join performance with `include` can produce
  N+1 queries on deeply nested relations. For this project's data model
  (< 5 tables) this is not a concern. A real project with deep joins may
  supplement with raw SQL views or a query builder.

## See also

- [ADR-0005](0005-pglite-tests.md) — the three-door client (PGlite/local/Azure)
  and how Prisma's generated client plugs into each.
- `docs/specs/monorepo.md` — the `packages/db/` workspace.