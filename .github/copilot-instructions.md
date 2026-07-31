# Copilot instructions

This repository's agent conventions live in [`AGENTS.md`](../AGENTS.md) —
read it first; it is the canonical instruction file for all coding agents.
Workflow and review rules are in [`CONTRIBUTING.md`](../CONTRIBUTING.md).

The two rules most often violated by generated code here:

1. Every database query is scoped by the current user; foreign or unknown
   resources return 404, never 403.
2. A change to behavior updates the spec that describes it
   (`docs/specs/…`) in the same PR — specs never contain issue numbers.

Use `pnpm` (never `npm`). Verify with `pnpm test && pnpm typecheck && pnpm build`.
