# ADR-0010: Reviewer-agent lifecycle and authority

## Status

Accepted

## Context

The monorepo ships seven reviewer specialists (`review-tests`,
`review-security`, `review-migrations`, `review-boundaries`,
`review-docs`, `review-architecture`, `review-skills`) plus a general
`review` orchestrator that delegates to them.

The planner (`plan.md`) carries two tables that must stay in sync with the
set of available specialists: the checklist table (mapping diff concerns to
specialists) and the delegate table (mapping planning needs to subagents). The
orchestrating reviewer (`review.md`) carries a third: the specialist
reference table. `plan.md` line 52 explicitly names `review-cloud`,
`review-auth`, and `review-api` as anticipated future specialists.

But neither file documents *who decides* when to mint a new one, or *what the
process* is. The rule is implicit in the two agent files. A future contributor
reading `docs/adr/` has no way to discover how a new specialist comes to exist.

This is the first ADR covering the tooling layer (`.opencode/`). Future
tooling-governance decisions (skill lifecycle, planner checklist format,
reviewer orchestration protocol) may follow the same pattern.

## Decision

### Surfacing the gap

The planner surfaces a missing-specialist gap in a plan's review checklist. If
a unit of work touches a concern (e.g., cloud infrastructure, Terraform, Azure
bindings) and no specialist exists to review it, the planner either:

- Flags the gap in the plan narrative ("this touches cloud config but no
  `review-cloud` exists — recommend creating one, or fall back to general
  `@review` checks"), or
- Maps the concern onto the closest existing specialist as a stopgap (e.g.,
  `@review-boundaries` for cloud import rules, `@review-security` for cloud
  credential handling).

The orchestrating `@review` confirms the gap at review time via its
"Augment" step (`review.md` line 19): when it scans the actual diff and finds
a concern not covered by any specialist in its reference table, it surfaces the
gap in its synthesis output.

If neither agent catches it — the planner overlooked it, and the diff doesn't
trigger a concern — then no gap exists for this unit of work. The process is
reactive to change, not proactive.

### Authority

The human decides whether to mint a new specialist or fold the concern into an
existing one. Not every domain deserves its own agent — over-fragmentation
makes orchestration noisier and increases the maintenance surface (five files
per specialist). This is a judgment call, not an automatic trigger.

### Creation process

When a new specialist is approved, the work is a five-file change:

1. Create `.opencode/agent/review-<domain>.md` modeled on existing
   `review-*.md` files: frontmatter with `mode: subagent` and `edit: deny`,
   then a body with "What you check" / "What you do NOT check" sections
   mirroring `review.md` lines 50–65.
2. Add a row to the checklist table in `plan.md` (the table at
   `plan.md` lines 42–50).
3. Add a row to the delegate table in `plan.md` (the table at
   `plan.md` lines 58–66).
4. Add a row to the specialist reference table in `review.md` (the table
   at `review.md` lines 25–33).
5. Add a row to `model-config.example.jsonc` (the agent config section)
   so the new specialist gets a model assignment.

### Runner-up considered

Auto-mint new specialists whenever the orchestrator detects an uncovered
concern, with an ID like `review-unknown` that gets renamed later. Rejected
because it bypasses human judgment on the fragmentation tradeoff and would
proliferate near-duplicate agents that must be cleaned up retroactively.

## Consequences

- **Easier**: the process is discoverable from `docs/adr/`. A newcomer can
  see *why* `review-cloud` doesn't exist yet and *what* it would take to
  add it. The two orchestrating agents stay in sync because the ADR names
  the exact tables that must be updated.

- **Harder**: minting a new specialist is now a five-file change instead of
  one. That is intentional friction — it forces the fragmentation tradeoff to
  be considered at each proposal rather than minting specialists as a reflex.

- **Accepted tradeoff**: this ADR sets the precedent that `.opencode/`
  tooling decisions are in-scope for `docs/adr/`. Future tooling-governance
  ADRs (skill lifecycle, planner checklist format, reviewer protocol) may
  follow. The Context section makes this explicit so the precedent is
  intentional, not accidental.

- **Accepted tradeoff**: the ADR references specific line ranges in
  `plan.md` and `review.md`. ADRs are immutable; if those tables are
  modified later, the line numbers in this ADR will go stale. The prose
  references the tables by their content heading ("the checklist table",
  "the delegate table", "the specialist reference table") with line numbers
  as parenthetical helpers. The heading references remain correct; the line
  numbers may drift.

## See also

- `.opencode/agent/plan.md` — the checklist and delegate tables this ADR
  governs, and line 52 which names the foreseeable future specialists.
- `.opencode/agent/review.md` — the orchestrator's "Augment" step that
  surfaces specialist gaps at review time.
- `docs/specs/monorepo.md` — notes that opencode skills auto-load into the
  system prompt, providing tooling-layer context.
