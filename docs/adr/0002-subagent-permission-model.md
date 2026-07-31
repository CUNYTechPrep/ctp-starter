# ADR-0002: Subagent bash permission model — granular allowlist

## Status

Accepted

## Context

The review subagents (`review.md`, `review-tests.md`, `review-security.md`,
`review-migrations.md`, `review-boundaries.md`, `review-docs.md`,
`review-architecture.md`, `review-skills.md`) and the `research` subagent
all set `bash: ask` in their frontmatter permission block. Under opencode's
permission model, per-agent rules take precedence over the global config
(see [Permissions docs](https://opencode.ai/docs/permissions#agents)). This
means the global `git *: allow` rule in `opencode.json` is overridden by the
coarser `bash: ask` in each subagent — so even `git diff` triggers a
permission prompt.

Subagents spawned via the task tool cannot reliably surface permission
prompts in the TUI. When a subagent hits a `bash: ask` gate, it blocks
waiting for a grant that the user never sees. The result is a hang.

The `architect-monorepo` subagent uses `bash: deny` and does **not** hang —
confirming that the hang is specific to `ask` on subagents, not a deeper
connectivity or model issue.

The initial QRSI + `@research` work (ADR-0010) added `research.md` with the
same `bash: ask` pattern, inheriting the same bug.

## Decision

### 1. Principle: subagents use allow or deny for bash, never ask

Subagents (agents with `mode: subagent`) must never use `bash: ask`. They
may use `bash: deny` (if they need no bash — e.g., `architect-monorepo`) or
`bash: <granular allowlist>` (if they need specific read-only commands).
Primary agents (`mode: primary`) may continue to use `bash: ask` — they
surface prompts in the TUI where the user can see and respond.

### 2. Granular allowlist for subagents that need bash

All nine affected subagents switch from `bash: ask` to a granular deny-by-default
allowlist:

```yaml
bash:
  "*": deny
  "git *": allow
  "rg *": allow
  "ls": allow
  "ls *": allow
  "cat *": allow
  "head *": allow
  "tail *": allow
  "wc *": allow
```

Rationale for each rule:

- `"*": deny` — anything not explicitly allowed is blocked. Defense-in-depth
  against destructive or network commands even though `edit: deny` already
  prevents file writes.
- `"git *": allow` — `git diff`, `git log`, `git status`. These are the
  primary tools for diff-first review. No opencode tool provides an
  equivalent to `git diff`.
- `"rg *": allow` — ripgrep for code search, a fallback when the Grep tool
  isn't used.
- `"ls"` / `"ls *": allow` — directory listing, a fallback for Glob.
- `"cat *"` / `"head *"` / `"tail *": allow` — file reading, a fallback for
  Read.
- `"wc *": allow` — line counting. No dedicated tool equivalent.

### 3. Affected files

Nine subagent files receive the same change of `bash: ask` → granular allowlist:

1. `.opencode/agent/review.md` (also keeps `task: allow`)
2. `.opencode/agent/review-tests.md`
3. `.opencode/agent/review-security.md`
4. `.opencode/agent/review-migrations.md`
5. `.opencode/agent/review-boundaries.md`
6. `.opencode/agent/review-docs.md`
7. `.opencode/agent/review-architecture.md`
8. `.opencode/agent/review-skills.md`
9. `.opencode/agent/research.md`

Primary agents (`plan.md`, `mentor.md`, `build.md`) are **not** affected —
they retain `bash: ask`.

### 4. Runner-ups considered

**Broad `bash: allow`.** Rejected — a subagent compromised by
prompt-injection in reviewed code could run arbitrary destructive shell
commands, even though `edit: deny` covers file writes. Defense-in-depth
justifies the narrower allowlist.

**Remove the `bash:` override entirely and inherit the global config.**
Rejected — the global config has `"*": "ask"`, so `rg`, `cat`, `ls`, `head`,
`tail`, and `wc` would still trigger permission prompts and hang. Does not
fully fix the bug.

**Move permissions to `opencode.json`'s `agent` section.** Rejected —
keeping permissions co-located in each agent's frontmatter matches the repo
convention and is easier to audit. The YAML object form is valid in
frontmatter.

## Consequences

- **Easier**: subagents no longer hang on permission prompts. `git diff` and
  common read-only commands execute without blocking.

- **Harder**: the allowlist must be maintained. If a subagent needs a command
  not on the list, it is silently denied (response: denied — no hang) rather
  than asked. The agent should fall back to a dedicated tool, or the
  allowlist should be extended. The silent-deny behavior is strictly better
  than a hang.

- **Easier**: the principle is explicit and discoverable from `docs/adr/`.
  A future contributor creating a new subagent knows: `bash: ask` is
  forbidden; use a granular allowlist or `bash: deny`.

- **Accepted tradeoff**: the allowlist is YAML frontmatter (object form),
  which matches the opencode docs' JSON agent-config example. If a future
  opencode version drops YAML-object support in frontmatter, these
  permissions must move to `opencode.json`'s `agent` section.

## See also

- `.opencode/agent/review.md` — orchestrator with `task: allow` + granular bash allowlist.
- The eight specialist review agents (`.opencode/agent/review-*.md`) and
  `.opencode/agent/research.md` — all updated.
- `.opencode/agent/plan.md`, `.opencode/agent/mentor.md`,
  `.opencode/agent/build.md` — primary agents unchanged, still `bash: ask`.
- [ADR-0010](0010-reviewer-agent-lifecycle.md) — precedent for `.opencode/`
  tooling ADRs and the governance pattern.
- [ADR-0011](0011-ideation-pipeline.md) — established `@research` subagent
  which inherited this bug.
- opencode [Permissions docs](https://opencode.ai/docs/permissions#agents)
  — agent rules take precedence over global config.