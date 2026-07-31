# AGENTS.md

Instructions for any coding agent working in this repository, in any harness.
This file is the canonical conventions document; harness-specific files
(CLAUDE.md, copilot-instructions) defer to it.

## What this is

A pnpm/Turborepo monorepo for a full-stack TypeScript web app: Next.js web
app, background worker, Prisma + Postgres, Azure blob/queue seams, Vitest.
Everything runs locally with no Docker and no cloud account.

## Commands

```bash
pnpm install
pnpm prisma:generate     # typed DB client — run after schema changes
pnpm dev                 # web + worker + embedded Postgres + Azurite
pnpm db:seed             # demo user + starter rows (dev must be running)
pnpm test                # unit + integration (PGlite — no services needed)
pnpm typecheck
pnpm build
pnpm db:reset            # wipe .pgdata; restart dev, then re-seed
```

Always `pnpm`, never `npm`. Tests need no running services — integration
tests use in-memory PGlite.

## Monorepo rules

- `apps/` are deployable processes (web, worker, db-server, migrate);
  `packages/` are shared libraries (db, services, domain, log, auth).
- No app imports from another app. Validation + queries live in
  `packages/domain` and are imported by web only.
- The `@project` scope is a placeholder — do not hardcode it in new code.
- Full layout and dependency rules: `docs/specs/monorepo.md`.

## Ground rules (violations are defects, not style)

- **Every query is scoped by the current user.** No client-supplied ids
  trusted. Foreign or unknown resources return 404, never 403.
- **Soft delete only** where the schema has `deletedAt`; default reads
  filter it.
- **History is transactional**: a write that implies an event writes both
  in one transaction.
- **Migrations are append-only.** Never edit an applied migration.
- **Errors have one shape**: `{ error: { code, message } }` — see
  `docs/specs/web.md`. Raw errors never reach a client.
- **Tests that can't fail don't count.** If a test passes with the feature
  deleted, it isn't a test.
- Never commit or edit `.pgdata/`, `.azurite/`, or `.env` files.

## The documentation system

Four document kinds — full rules in `CONTRIBUTING.md` and `docs/README.md`:

- **Specs** (`docs/specs/`) — evergreen, present tense. `type: infrastructure`
  specs are cross-cutting contracts; `type: feature` specs live under
  `docs/specs/<domain>/<feature>.md`. Templates: `docs/specs/_template-feature.md`
  (every section required) and `docs/specs/_template-infrastructure.md`.
- **ADRs** (`docs/adr/`) — write-once decisions. Supersede, never edit.
- **Postmortems** (`docs/postmortems/`) — write-once bug history, arrives
  with the fix PR.
- **Runbooks** (`docs/runbooks/`) — drilled operational procedures.

**A PR that changes behavior updates the spec that describes it, in the same
PR.** Linkage is one-way: issues and PRs cite specs by path; specs never
contain issue numbers, PR links, or dates (postmortems are the exception —
they cite freely).

## How feature work flows

1. A GitHub issue is the **seed**: Why, behavior sketch, out of scope,
   verify sketch. It is not a spec.
2. The session starts by drafting the spec from the issue, using the
   feature template. The human reviews and corrects the draft **before**
   implementation.
3. Implement from the reviewed spec. Spec and code land in the same PR.
4. The spec is thereafter the source of truth; the issue is history.

**Scope discipline: implement only the feature in play.** Other specs in
`docs/specs/` are context, not instructions — do not build ahead of the
current issue, and do not "improve" adjacent behavior without a spec change.

## Before declaring work done

- `pnpm test`, `pnpm typecheck`, and `pnpm build` pass.
- The spec's **Verify** section is actually true — run the drill it names
  (curl check, keyboard-only pass, stopped-database check).
- The documentation the change owes (spec / ADR / postmortem / runbook)
  is in the diff.
- Read your own diff. The human owns what merges; make that ownership easy.

## Output discipline

- **Lead with the artifact** — the diff, the command, the answer. Context
  after, and only if it earns its lines.
- Do not restate the request, announce what you are about to do, or
  summarize what you just did. The diff is the summary.
- Explanation budget: **one sentence per non-obvious choice**. Reasoning
  that deserves more than a sentence deserves a durable home — put it in
  the spec's Constraints & decisions or an ADR, and say "see X". The
  transcript is ephemeral; the docs are not.
- Answer questions directly, shortest true form first; elaborate on request.

## Boundaries for agents

- Do not create, close, or edit GitHub issues unless explicitly asked.
- Do not edit accepted ADRs or landed postmortems — ever.
- Do not add dependencies without saying so and why in the plan.
- When a contract in an infrastructure spec blocks the task, stop and say
  so — proposing an ADR is the path, not working around the contract.
