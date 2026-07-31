# ADR-0009: Validation + queries live in a web-only domain package

## Status

Accepted

## Context

The web app validates user input (Zod schemas) and runs database queries
(Prisma) that are specific to its request-handling layer. The worker also
reads and writes the database, but does so via direct Prisma calls from its
own job handlers — it does not reuse the web app's query layer. Co-locating
validation and query logic in the web package would make it invisible to other
packages but would also prevent accidental reuse where reuse is harmful.

## Decision

Extract validation schemas and web-specific queries into `packages/domain/`,
a standalone package that only the web app imports.

- `packages/domain/` exports Zod schemas (`CreateItem`, `CreateItemInput`)
  and higher-level Prisma queries (`listItems`, `createItem`).
- The worker explicitly does NOT import `@project/domain`. It reads and
  writes the database directly using the Prisma client from `@project/db`,
  which gives it full access to the data layer without the web's validation
  assumptions.
- The boundary is enforced by package.json dependencies: only `apps/web`
  lists `@project/domain` as a dependency. The worker cannot import it
  without adding it explicitly — and it never should.

## Consequences

- **Easier**: the boundary between web-specific query logic and
  worker-specific query logic is explicit in the dependency graph. A future
  contributor adding a query to `packages/domain/` knows it will only be
  called from the web.
- **Harder**: the worker duplicates some query logic (e.g., looking up an
  item by ID). This duplication is intentional — the worker reads data in
  its own context and should not inherit web-specific validation.
- **Accepted tradeoff**: a real project with more consumers might want a
  shared query package or CQRS. For this project's scale, the boundary is
  worth more than the DRY bonus.

## See also

- [ADR-0001](0001-monorepo-turbo.md) — the no-app-imports-app rule that this
  boundary is part of.
- `docs/specs/monorepo.md` — the current package layout and dependency
  graph.