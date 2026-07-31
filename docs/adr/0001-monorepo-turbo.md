# ADR-0001: Monorepo with pnpm workspaces + Turborepo

## Status

Accepted

## Context

The project needed to ship several deployables (a web app, a background worker,
a migration CLI, a dev database host) plus shared libraries. Colocating them in
one repository reduces context-switching for contributors and makes cross-package
refactors (e.g., renaming a column in the Prisma schema that both web and worker
import) a single commit rather than coordinated publishes.

## Decision

Use pnpm workspaces for package management and Turborepo for task orchestration.

- **pnpm workspaces** over npm/yarn for its stricter dependency isolation and
  disk-efficient linking.
- **Turborepo** for its parallel task execution, caching, and dependency graph.
- Each workspace is either an `apps/` (deployable) or a `packages/` (shared
  library). No app imports from another app — the dependency graph flows through
  packages only.

## Consequences

- **Easier**: cross-package changes land as one diff; CI runs only affected
  packages; new contributors set up once and get all workspaces.
- **Harder**: the monorepo's `node_modules` is larger than individual repos;
  `pnpm-lock.yaml` is a single source of conflict.
- **Accepted tradeoff**: the `@project` scope is a placeholder. A real project
  replaces it via search-and-replace across all `package.json` files. This is
  intentional — it forces the first contributor to touch every workspace and
  understand the naming convention.

## See also

- [ADR-0007](0007-domain-web-only.md) — the web-only domain package boundary,
  an instance of the no-app-imports-app rule.
- `docs/specs/monorepo.md` — current monorepo shape and conventions.