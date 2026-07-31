# ADR-0011: Ideation pipeline and `@research` subagent

## Status

Accepted

## Context

The planner (`plan.md`) produces plans by asking clarifying questions and
then writing a numbered execution plan — but it has no structured ideation
stage. It does not:

- Investigate the codebase **before** synthesizing (it reads files reactively
  during planning, not as a deliberate investigation gate).
- Generate **multiple alternatives** with tradeoffs before committing to one.
- **Self-critique** the draft plan against risks, edge cases, or missing
  specialists before presenting it.

The review-agent lifecycle (ADR-0010) established a pattern for specialist
subagents: seven `review-*` agents plus `architect-monorepo`, all on the
reasoning tier. But there is no **general-purpose codebase investigator** —
a catch-all subagent for grep/glob/file-read sweeps, ADR/spec lookup, and
package structure exploration that does not fit the narrow scopes of
`architect-monorepo` (placement only) or `review-architecture` (ADR/spec
quality only).

The user requested a five-stage pipeline—**Question · Reflect · Synthesize ·
Plan · Iterate** (QRSI)—integrated into the planner, plus a cheap `@research`
subagent usable by multiple primary agents, not just the planner.

## Decision

### 1. QRSI pipeline lives in `plan.md` (not a skill)

The five-stage pipeline is baked into `plan.md` as a new `## QRSI pipeline`
section replacing the previous `## Behavior` section. The stages are:

- **Question** — structured Q&A gate before any investigation. Use the
  `question` tool. Do not proceed until the user's intent is unambiguous.
- **Reflect** — delegate to `@research` for codebase investigation. Read
  ADRs, specs, and Engram memory. Use `architect-monorepo` for placement
  and `review-boundaries` for import-rule verification.
- **Synthesize** — generate 2–3 alternatives with one-sentence tradeoffs.
  Do not pick yet; present to the user if ambiguous.
- **Plan** — commit to one approach, write the numbered execution plan with
  per-file current/desired/change, risks, and the review checklist.
- **Iterate** — self-critique the draft against edge cases, risks, missing
  specialists, and builder ambiguity. Revise, then present.

**Runner-up considered: a dedicated skill in `.opencode/skill/ideation/`.**
Rejected because skills auto-load into **all** primary agents' system prompts
when their description keywords match. A QRSI skill would inject planner-stage
instructions into `build`'s and `mentor`'s context, where they are not
applicable. The pipeline is planner-specific workflow; `plan.md` is where
planner workflow belongs.

**Future escape hatch:** if a second primary agent later adopts the same
shape, extract to a skill at that point. This is the same pattern ADR-0010
uses: "not now, but the path is clear."

### 2. `@research` subagent on the fast tier

A new subagent is created at `.opencode/agent/research.md` with
`mode: subagent`, `permission: { edit: deny, bash: ask }`. It performs
read-only codebase investigation (grep, glob, file-read, ADR/spec/skill
lookup, package-structure inspection, Engram-memory search) and returns a
structured digest with four sections: Facts found (file:line citations),
Constraints, Open questions, Confidence.

**Model tier:** `openrouter/deepseek/deepseek-v4-flash` — the fast tier,
shared with `build`. This is the **first** non-`build` agent on the fast
tier. All other read-only subagents (`architect-monorepo`, all seven
`review-*`) use the reasoning tier (`minimax/minimax-m3`). The fast tier is
justified because `@research`'s work is shallow-context (grep/glob/file-read
sweeps, keyword lookup) where reasoning quality matters less than throughput.
The `@research` output is consumed by a reasoning-tier agent (the planner)
that re-verifies key claims.

**Relationship to existing specialists:** `architect-monorepo` stays the
placement specialist. `review-architecture` stays the ADR/spec-quality
specialist. `@research` is the catch-all that any primary agent invokes when
no specialist fits the question.

### 3. Delegate-table rows in three primary agents

`@research` is exposed to the agents that benefit from a general investigator:

- **`plan.md`** — added row "Codebase investigation not covered by a
  specialist → `@research`". This row is referenced by the Reflect stage.
- **`mentor.md`** — added row "Open-ended codebase questions → `research`".
- **`build.md`** — added a Delegate to subagents table with row
  "Investigate the codebase before a refactor (find all call sites, locate
  patterns, read package structure) → `@research`".

`review.md` does **not** get a row — it orchestrates its own specialists and
reads diffs directly; `@research` would be redundant.

**Staleness risk:** If `@research`'s scope changes, these three tables must
be updated. Named explicitly here so a future contributor knows which files.

### 4. Model-config addition

`.opencode/model-config.example.jsonc` gains a row:

```jsonc
"research": { "model": "openrouter/deepseek/deepseek-v4-flash" }
```

This is added as part of the same change, alongside the agent file.

## Consequences

- **Easier**: the planner now follows a deliberate five-stage pipeline,
  producing better-vetted plans. The `@research` subagent offloads cheap
  codebase investigation from the reasoning tier, reducing cost for the
  investigation step.

- **Easier**: `@research` is a general investigator usable by any primary
  agent. A mentor can delegate "find what we said about X in the codebase"
  without running the full reasoning tier.

- **Harder**: three delegate tables (`plan.md`, `mentor.md`, `build.md`) must
  be kept in sync if `@research`'s scope changes. This is the same staleness
  risk ADR-0010 flagged for the review-specialist tables.

- **Harder**: the first fast-tier subagent sets a precedent. Future
  contributors may ask "if `@research` is on the fast tier, why isn't
  `architect-monorepo`?" — answered in the Context above (shallow vs deep
  reasoning).

- **Accepted tradeoff**: QRSI lives in `plan.md` rather than a skill. If a
  second agent adopts the same shape, the content must be extracted at that
  point. Duplicating it now would be premature.

- **Resolved tradeoff**: initially ADR-0010 noted no reviewer specialist
  existed for `.opencode/agent/` files — a `review-agents` specialist was
  created alongside this ADR (before commit) following ADR-0010's 5-file
  minting process. The contents of `.opencode/agent/` files are now covered
  by a dedicated reviewer.

## See also

- `.opencode/agent/plan.md` — the QRSI pipeline (the `## QRSI pipeline`
  section) and the `@research` delegate row (the `## Delegate to subagents`
  table).
- `.opencode/agent/research.md` — the new subagent.
- `.opencode/agent/mentor.md` — the `@research` delegate row added.
- `.opencode/agent/build.md` — the `@research` delegate table added.
- `.opencode/agent/review-agents.md` — the agent-files reviewer specialist.
- `.opencode/model-config.example.jsonc` — model config with `research`
  and `review-agents` rows.