# docs — decisions, specs, and history

Navigate the documentation by the question you're asking:

| Question | Where to look |
|---|---|
| "Why did we choose X?" | `docs/adr/` — one file per decision |
| "How does subsystem Y fit together?" | `docs/specs/` — per-subsystem specs, tagged by type |
| "What went wrong before, and what did we learn?" | `docs/postmortems/` — write-once bug history |
| "Something broke — what do I do?" | `docs/runbooks/` — drilled, step-by-step procedures |
| "What does this file do?" | The 2–3 line header comment at the top of the source file |

## Quick start

Read **`docs/specs/seams.md`** first — it's the unifying idea
behind the whole project. Everything else is a specific instance of the
same pattern.

## Spec types

Specs in `docs/specs/` use a `type:` frontmatter tag:

- **`infrastructure`** — cross-cutting subsystems present on every branch
  (seams, monorepo, storage adapters). Live on `main`, inherited by all branches.
  New ones start from `docs/specs/_template-infrastructure.md`.
- **`feature`** — user-facing behavior of the application. Live under
  `docs/specs/<domain>/<feature>.md`, grouped by domain.
  New ones start from `docs/specs/_template-feature.md`.

Specs are evergreen — update in place as the feature changes; rename or
reorganize within a domain folder when features merge or split.

## Four lifecycles

- **Specs** are evergreen: present tense, updated by the PR that changes the
  behavior. Linkage is one-way — issues cite specs; specs store no issue state.
- **ADRs** are write-once decisions: supersede, never edit.
- **Postmortems** are write-once history: they arrive with the fix PR and cite
  freely (issues, PRs, dates) — see `docs/postmortems/README.md`.
- **Runbooks** are evergreen procedures: what a human does when something
  breaks, updated by the PR that changes the procedure, tested by drills —
  see `docs/runbooks/README.md`.

## Monorepo quick reference

```
apps/                           # deployable processes
├── web/                        #   Next.js app (the UI)
├── worker/                     #   background worker
├── db-server/                  #   dev-only Postgres host
└── migrate/                    #   migration CLI

packages/                       # shared libraries
├── db/                         #   Prisma schema + client + apply-migrations
├── services/                   #   Azure adapters (queue, storage, notify)
├── domain/                     #   Zod schemas + queries (web-only)
├── log/                        #   pino logger
└── auth/                       #   dev identity stub
```

**Rules**: apps are deployable, packages are shared; no app imports from another app;
the `@project` scope is a placeholder to be replaced via search-and-replace.

Adding a package: create `packages/<name>/`, add workspace to `pnpm-workspace.yaml`,
add `"@project/<name>": "workspace:*"` in the consuming app's dependencies.
Adding an app: create `apps/<name>/`, add workspace to `pnpm-workspace.yaml`.

## Maintaining

- New ADRs go in `docs/adr/` — see the `architecture-docs` skill for the format.
- Infra specs use `type: infrastructure` frontmatter; feature specs use `type: feature`.
- Postmortems land via the fix PR, named `YYYY-MM-<slug>.md` — never edited after.
- Runbooks update in the PR that changes the procedure; drills update "Last drilled".
- The `review-architecture` agent reviews `adr/`, `specs/`, `postmortems/`, and `runbooks/`.
- `review-docs` reviews READMEs and file headers; it does NOT touch specs or ADRs.
