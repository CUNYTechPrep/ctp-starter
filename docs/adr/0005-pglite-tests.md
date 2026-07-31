# ADR-0005: PGlite for tests, three-door client

## Status

Accepted

## Context

The project needed a way to run unit and integration tests that don't depend
on a running Postgres server. At the same time, the Prisma client had to work
against three different Postgres targets: in-memory (tests), local Postgres
(dev), and Azure Postgres (prod).

## Decision

Use PGlite (Postgres-in-WebAssembly) for the test door, and build a three-door
client that picks the target from the environment.

- The `packages/db/src/client.ts` exports a cached Prisma client that connects
  to PGlite (when `PGLITE_DATA_DIR` is set), local Postgres (default), or a remote
  `DATABASE_URL` (prod). The client is cached in `globalThis` to survive
  Next.js hot reloads.
- **PGlite** runs Postgres in-process via WebAssembly. Tests are fast — no
  socket, no server startup, no teardown. Data is ephemeral per test suite.
- Unit tests (`pnpm test`) use PGlite. Integration tests (`pnpm test:integration`)
  can use either PGlite or a real server.
- The three doors share the same Prisma client type. No code paths branch on
  which door is active — the client handles the connection internally.

## Consequences

- **Easier**: zero-install test setup; no Docker; same query API across all
  three environments; the `db:reset` command nukes the local Postgres while
  PGlite tests are unaffected.
- **Harder**: PGlite does not support every Postgres extension; `pg_notify` is
  unavailable in PGlite (SSE tests require a real Postgres or mocking).
- **Accepted tradeoff**: the three-door pattern adds complexity to the client
  file. In a real project with unified Postgres access (e.g., RDS for dev and
  prod), this could be simplified.

## See also

- [ADR-0004](0004-prisma-orm.md) — why Prisma, and how the generated client
  plugs into all three doors.
- `docs/specs/seams.md` — the seam pattern; this ADR is one instance.