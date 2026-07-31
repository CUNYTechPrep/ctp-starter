---
name: documentation-style
description: Use when writing or updating READMEs, evergreen file comments, or any prose documentation in this project. The style guide for documentation.
---

# Documentation Style Guide

This guide covers the tone, structure, and conventions for all documentation in the project:
- **READMEs** (root, app, package) — owned by `review-docs`
- **Evergreen file comments** — owned by `review-docs`
- **Subsystem specs** (`docs/specs/`) — reviewed by `review-architecture` (which loads the `architecture-docs` skill for format)
- **ADRs** (`docs/adr/`) — reviewed by `review-architecture` (which loads the `architecture-docs` skill for format)

## README structure

### Root README
- Project overview, get running (commands), architecture map, monorepo layout, rules of the road, commands table, FAQ.

### App READMEs (`apps/*/README.md`)
- What the app is (deployable process), what it does, public surface (routes, job types, commands), dependencies (which `@project` packages it uses), consumers, local dev, production story.

### Package READMEs (`packages/*/README.md`)
- What the package is (shared library), public API (exports table), dependencies (other `@project` packages + external), consumers, usage notes (env vars, configuration), when to add something new.

## Evergreen file comments

Every source file (`.ts`, `.tsx`, `.prisma`) has a header comment:
- **2–3 lines** — no more.
- **Purpose only**: what this file does, not how.
- **No implementation details**: don't describe the current code.
- **No time-bound content**: don't mention weeks, sprints, or "currently".
- **Stable**: the comment should stay accurate as the file evolves.

Good: `// The Prisma client. One client per process, cached in a global to survive hot reloads. Three doors: PGlite (tests), local Postgres (dev), Azure (prod).`
Bad: `// Currently we use Azurite for local storage. Week 10 replaces this with Azure.`

## Tone
- Pedagogical but concise: explain the WHY, not the WHAT.
- Assume the reader knows the basics but not the architecture.
- Use "you" for the reader, "it" for the code.
- Avoid jargon unless the README's audience would expect it.

## When to update documentation

### READMEs and file headers
- A package or app is added → create its README + update the root README.
- A package or app is renamed → update every reference in every README.
- A public API changes → update that package's README exports table.
- A dependency is added/removed → update the Dependencies section.
- A file's header comment no longer describes its purpose → update it.

### Subsystem specs (`docs/specs/`)
- A subsystem's behavior, boundaries, or error handling changes → update the relevant spec.
- A new subsystem is added → create a spec in `docs/specs/`.
- When you update a spec, link any ADRs that shaped the current design.
- Spec sections: Behavior, Boundaries, Error states, Testing, Key decisions. (The `architecture-docs` skill loaded by `review-architecture` has the full format guide.)

### ADRs (`docs/adr/`)
- A decision is made → create a new ADR.
- A decision is reversed → create a new ADR that supersedes the old one.
- ADR format: Nygard template (Status, Context, Decision, Consequences). (The `architecture-docs` skill loaded by `review-architecture` has the full format guide.)

### Ownership
| Document type | Agent |
|---|---|
| READMEs (root, app, package), evergreen file comments | `review-docs` |
| ADRs, subsystem specs | `review-architecture` |
| Skills | `review-skills` |
