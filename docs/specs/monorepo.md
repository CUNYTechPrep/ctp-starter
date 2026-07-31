---
type: infrastructure
---
# Monorepo

The project is a pnpm workspaces monorepo with Turborepo for task orchestration.
Seven deployables and shared libraries live in the same repository.

## Layout

```
apps/                           # deployable processes
├── web/                        #   Next.js app (the UI)
├── worker/                     #   background worker
├── db-server/                  #   dev-only Postgres host
└── migrate/                    #   migration CLI + seed script

packages/                       # shared libraries
├── db/                         #   Prisma schema + client + apply-migrations
├── services/                   #   Azure adapters (queue, storage, notify)
├── domain/                     #   Zod schemas + queries (web-only)
├── log/                        #   pino logger
└── auth/                       #   dev identity stub
```

## Dependency rules

- **Apps** are deployable. **Packages** are shared.
- **No app imports from another app.** The dependency graph flows through
  packages only. If two apps need the same utility, it goes in a package.
- **The `@project` scope is a placeholder.** A real project replaces it
  via search-and-replace across all `package.json` files. The `@project`
  scope is never hardcoded in new code.

## Key decisions

- [ADR-0001](../adr/0001-monorepo-turbo.md) — why monorepo, pnpm, Turborepo.
- [ADR-0009](../adr/0009-domain-web-only.md) — why `packages/domain/` is web-only
  and the worker cannot import it.

## Changing the layout

- **New package**: add workspace to `pnpm-workspace.yaml`; create `packages/<name>/`;
  add `"@project/<name>": "workspace:*"` in the consuming app's dependencies.
- **New app**: add workspace to `pnpm-workspace.yaml`; create `apps/<name>/`;
  add dependencies as needed.
- **Rename a package**: update the dependency in every consumer's `package.json`;
  update all imports; update this doc and the relevant READMEs.

## Skill payload (cache optimization)

Every opencode skill in `.opencode/skill/` auto-loads its *description* into
every session's system prompt and loads its *body* on demand (persisting for all
subsequent turns). Body size directly increases conversation context per turn
once loaded. When adding or editing a skill, prefer tight prose over template
blocks — the actual files in `docs/adr/` and `docs/specs/` serve as canonical
examples. This keeps prompt-cache costs stable as the skill set grows.