# Contributing

How work moves through this repo — from idea to merged PR. The mechanics of
getting the app running are in the [README](README.md).

## The shape of a change

Every substantive change follows the same arc:

1. **Issue** — the seed. Use the Feature form: Why, a behavior sketch, out of
   scope, a verify sketch. Small enough to say what and why; not a spec.
2. **Spec** — the working session starts by drafting the spec from the issue,
   following [`docs/specs/_template-feature.md`](docs/specs/_template-feature.md).
   Every section is required; Examples and Constraints & decisions are where
   the draft must go beyond the issue. Review and correct the draft *before*
   implementing — it's cheaper to fix a sentence than a subsystem.
3. **Implement** — from the spec, not from vibes. If the agent drafts the
   code, you own it: read it, run the Verify section, sign your name to it.
4. **PR** — spec and code land together. The PR template's checklist is the
   contract: behavior changed ⇒ spec changed, same PR.

## The documentation system

Four kinds of documents, four lifecycles:

- **Specs** (`docs/specs/`) are **evergreen**: present tense, describing the
  system as it is. Updated in place by the PR that changes the behavior.
  `type: infrastructure` specs are cross-cutting contracts; `type: feature`
  specs live under `docs/specs/<domain>/`, one per shippable behavior.
- **ADRs** (`docs/adr/`) are **write-once**: one decision each, with context
  and tradeoffs. To change a decision, write a new ADR that supersedes the
  old one. Never edit an accepted ADR.
- **Postmortems** (`docs/postmortems/`) are **write-once history**: a fixed
  bug's investigation, root cause and all, moved in by the fix PR. See that
  folder's README for the bar and the template.
- **Runbooks** (`docs/runbooks/`) are **evergreen procedures**: what a human
  does when something breaks. The PR that changes a procedure updates its
  runbook; drills keep them honest.

Linkage is **one-way**: issues and PRs cite specs by path; specs never store
issue numbers, dates, or status. To find a spec's history, search issues and
PRs for its path.

## Ground rules the reviewer will hold you to

- Every query is scoped by the current user. No client-supplied ids trusted.
  Foreign or unknown resources return 404 — existence is not confirmed to
  non-owners.
- Writes that imply a history event write both in one transaction.
- Migrations are append-only; editing an applied migration is never correct.
- Tests that can't fail don't count. If a test would pass with the feature
  deleted, it's not a test.

## Before you push

```bash
pnpm test        # unit + integration (PGlite — no external services needed)
pnpm typecheck
pnpm build
```

CI runs the same three. A PR that's red on any of them isn't ready for a
reviewer's time.
