# Starter Skeleton — C12 Fall 2026

Use this template, its your app now.

(And when it *is* your app — named, with a feature or two shipped — replace
this file: `cp README.template.md README.md`, fill in the placeholders, land
it as a PR. This page is the starter's README, not your project's. See
[README.template.md](README.template.md).)

The layers of a real web application exists in this repo — a page, an API,
a database, tests, CI. All of it minimal. **You will work in
layers we haven't studied yet. That's not a gap in the plan; that's the job.**
Each week of class goes deep on one layer that's already here under your feet.

## Get running (no Docker, no installs beyond Node)

```bash
pnpm install
pnpm prisma:generate     # builds the typed database client (empty schema — example branches add models)
pnpm dev                 # starts web + YOUR OWN Postgres server + Azurite
```

`pnpm dev` starts **four processes**: the Next.js app, the background worker,
a real PostgreSQL server that npm installed for you (data in `.pgdata/`,
migrations auto-apply on boot), and Azurite (local Azure blob + queue storage,
data in `.azurite/`).

Check it worked: `http://localhost:3000/api/health`
says `{"status":"ok","db":"ok"}`.

## The map

```
browser ──fetch────▶ apps/web/app/api/health/route.ts
                ───▶ packages/db ──▶ YOUR Postgres server (:5433)
                ───▶ packages/services (queue + storage + notify) ──▶ Azurite
                    apps/worker
                    polls queue, processes jobs
```

Every cloud dependency follows the same pattern — a **seam**: local stand-in by
default, real Azure when an env var says so. See `docs/specs/seams.md`.

## The monorepo layout

```
apps/                           # deployable processes
├── web/                        #   Next.js app (the UI)
├── worker/                     #   background worker
├── db-server/                  #   dev-only Postgres host (replaced by Azure in Week 10)
└── migrate/                    #   migration CLI + seed script

packages/                       # shared libraries
├── db/                         #   Prisma schema + client + apply-migrations
├── services/                   #   Azure adapters (queue, storage, notify)
├── domain/                     #   Zod schemas + queries (web-only)
├── log/                        #   pino logger
└── auth/                       #   dev identity stub (real auth in Week 8)
```

**Apps** are deployable. **Packages** are shared — no app imports from another app.
Every package has a README explaining its role.

**Example branches** add their own models, API routes, workers, and feature specs
under `docs/specs/<domain>/`.

## Rules of the road

- Work on a branch; open a PR; your pod reviews it with the checklist. Every PR gets
  a green check or a red X from CI — red means fix it before asking for review.
- **No AI-generated code gets merged unread.** You own every line in your PR.
- Stuck 15 minutes? Pod thread → stand-up → TA → office hours. In that order.

## Commands

| Command | What it does |
|---|---|
| `pnpm dev` | Start all four processes: web + worker + Postgres + Azurite |
| `pnpm dev:web` | Next.js app only |
| `pnpm worker` | Background worker only |
| `pnpm db:dev` | Dev Postgres server only |
| `pnpm azurite` | Azure storage emulator only |
| `pnpm test` | Run all unit tests (what CI runs) |
| `pnpm test:integration` | Run integration tests against PGlite |
| `pnpm typecheck` | TypeScript, strict, for every package |
| `pnpm db:migrate` | Apply migrations over the wire |
| `pnpm db:reset` | Nuke local DB, re-migrate |
| `pnpm prisma:generate` | Regenerate the Prisma client |

## OpenCode agents

This repo ships with opencode agent files in `.opencode/`. The default agent is
`mentor` — a teaching-mode agent that explains rather than edits. Switch to
`build` when you want to execute a plan. The `@project` scope is a placeholder;
replace it via search-and-replace across all `package.json` files.

## FAQ

**Why am I running my own database server?** Because databases ARE servers —
one process owns the data files, everything else (the web app, the worker,
`psql`) connects as a client. npm installed a real PostgreSQL for you
(`apps/db-server/` runs it; data in `.pgdata/`; `db:reset` nukes it). In
Week 10 you swap YOUR server for Azure's managed one by setting a single env
var (`DATABASE_URL`) — same wire protocol, same driver, same code. Tests skip
the server entirely and run PGlite (Postgres-in-WebAssembly) in memory —
that's the third door in `packages/db/src/client.ts`.

**What's Azurite?** Microsoft's official storage emulator, running from npm —
fake Azure Blob + Queue storage on your laptop (data in `.azurite/`). Attached
images and job messages live in its blob / queue stores. In Week 10, one env var
points the same code at real Azure Storage.

**Why is there stuff in here we haven't learned?** Because that's what every
codebase you'll ever be hired into looks like. Use AI to read it — then verify
what it tells you by running the code. That habit is the whole course.

**Where are the example apps?** This is the boilerplate `main` branch — empty
schema, generic infrastructure. Switch to an `example/*` branch to see a
working application built on the same skeleton. Each example branch has its
own feature specs in `docs/specs/<domain>/`.
