---
name: architecture-docs
description: Use when writing or deciding between ADRs, specs (feature or infrastructure), postmortems, and runbooks — "why we chose X", new behavior, cross-cutting contracts, fixed bugs, or operational procedures. Format and decision guide for docs/adr/, docs/specs/, docs/postmortems/, and docs/runbooks/.
---

# Architecture Documentation

Four document kinds: **ADRs** in `docs/adr/` capture individual decisions (write-once), **specs** in `docs/specs/` describe behavior as it is (evergreen), **postmortems** in `docs/postmortems/` record fixed bugs (write-once history), **runbooks** in `docs/runbooks/` give the tested procedure a human executes when something breaks (evergreen, drilled). File-level header comments (2–3 lines in source files) are a separate tier — see the `documentation-style` skill.

## Folder map

- `docs/README.md` — orientation and monorepo quick reference
- `docs/adr/README.md` — ADR index with status; `NNNN-title.md` — one per decision
- `docs/specs/README.md` — spec index with type column; specs use `type:` frontmatter
- `docs/specs/_template-feature.md` — template for feature specs (every section required)
- `docs/specs/_template-infrastructure.md` — template for infra specs (fixed open/close, free middle)
- `docs/specs/<domain>/<feature>.md` — feature specs, grouped by the domain they describe
- `docs/postmortems/` — `YYYY-MM-<slug>.md`, from `docs/postmortems/_template.md`
- `docs/runbooks/` — `<situation-slug>.md`, from `docs/runbooks/_template.md`; the folder README indexes each with its trigger

## Which document? (the decision)

Ask what kind of thing you are recording:

- **A choice was made between real alternatives** (library, pattern, topology — something a newcomer would ask "why this way?") → **new ADR**. If no alternative was seriously live, it is not ADR-worthy; put a line in a spec or README.
- **A shippable behavior is being built or changed** → **feature spec** under `docs/specs/<domain>/`, from `_template-feature.md`. Born in the working session that builds it: drafted from the seed issue, reviewed, landed in the same PR as the code. Update in place thereafter.
- **A cross-cutting contract that holds on every branch** (a seam, a server standard, an error shape other specs point at) → **infrastructure spec** at the top of `docs/specs/`, from `_template-infrastructure.md`.
- **A bug was fixed and there is a lesson** → **postmortem** in `docs/postmortems/`, from its `_template.md`, in the same PR as the fix. The bar: would the next person who hits something similar learn from it? A typo fix does not clear it. The same PR amends the spec the bug contradicted — or writes the spec whose absence the bug exposed.
- **A procedure a human executes when something breaks** (rollback, secret rotation, recovery) → **runbook** in `docs/runbooks/`, from its `_template.md`. Specs say what the system does; runbooks say what a person does. Imperative numbered steps, destructive steps flagged, drilled on purpose. The PR that changes the procedure updates the runbook.
- **A decision is reversed** → new ADR supersedes the old one; the old ADR's Status updates to `Superseded by ADR-NNNN`. Never edit the body of an accepted ADR.
- **How to run/develop something** → README tier, not a spec. **What one file does** → header comment tier.

One change often produces more than one document: a fix PR may carry a postmortem *and* a spec amendment; a new subsystem may carry an ADR *and* an infra spec. That is normal — each records a different kind of fact.

## The linkage rule

Linkage is **one-way**: issues and PRs cite specs by path; specs never contain issue numbers, PR links, dates, or status. A spec's history is found by searching issues/PRs for its path. **Postmortems are the exception** — they are history documents and cite freely (issue, PR, dates belong there). Runbooks follow the spec rule: they link specs and postmortems, never issue state.

## ADR format (Nygard)

Sections: **Status** (Accepted / Proposed / Superseded by ADR-NNNN), **Context** (forces at play), **Decision** (what was chosen, including runner-up), **Consequences** (easier + harder + tradeoffs), **See also** (related ADRs, specs).

Rules:
- **Filename**: `NNNN-kebab-case-title.md`. Next number from `docs/adr/README.md`.
- **Status**: exactly one of the three values. A superseded ADR is not deleted — its Status updates.
- **Mutability**: ADRs are immutable once Accepted. Change via new ADR that supersedes.
- **Index**: every new ADR adds a row to `docs/adr/README.md`.

## Spec format

Every spec is **evergreen**: present tense, describing the system as it is; the PR that changes the behavior updates the spec in the same PR. Stale specs mislead faster than missing specs. Each begins with a YAML frontmatter `type:` tag.

- **`type: feature`** — one shippable behavior, under `docs/specs/<domain>/<feature>.md`. Follow `_template-feature.md`; **every section is required** (Why, Where it lives, Behavior, Examples, Verify, Constraints & decisions, Out of scope). If a section is genuinely empty, say why in one line rather than deleting it. One spec ≈ one shippable behavior; decompose pipelines that cross features into one spec per feature, cross-referenced. Each domain folder has a `README.md` as its index.
- **`type: infrastructure`** — a cross-cutting contract on `main`, top-level in `docs/specs/`. Follow `_template-infrastructure.md`: opens with **Purpose**, closes with **Verify** and **Key ADRs**, free-form middle that fits the content (seam table, error-state tables, standards list — see seams.md, storage.md, web.md for the range). If a rule has a number, the number is the contract — write it down.

Common rules:
- **Reference ADRs**: link the decisions that shaped the behavior; context lives there, not in the spec.
- **File headers are NOT specs**: don't duplicate the 2–3 line source headers.
- **No issue state inside specs** (see the linkage rule).

## Postmortem format

From `docs/postmortems/_template.md`: header line citing issue/PR/spec, then **Report**, **Expected vs actual** (quote the spec — "no spec covered this" is part of the root cause), **Root cause** (the mechanism, not the symptom), **The fix**, **Why our defenses missed it**, **What changed beyond the fix** ("nothing" is itself a finding).

Rules:
- **Write-once**: never edited after landing. New understanding goes in the spec or a new postmortem.
- **Filename**: `YYYY-MM-<slug>.md` — chronology is part of the story.
- **Arrives with the fix**: same PR as the code change and the spec amendment.
- **Blameless**: name causes, not people.

## Runbook format

From `docs/runbooks/_template.md`: a **Use when** trigger line and **Last drilled** line up top, then **Before you start** (access + blast radius), **Steps** (numbered, imperative, one action each; ⚠ on destructive steps with what they destroy), **Verify it worked** (concrete end state), **If this didn't work** (escalation boundary), **Related** (spec + motivating postmortem).

Rules:
- **Evergreen**: the PR that changes the procedure updates the runbook, same PR. Stale runbooks are confidently wrong at the worst moment.
- **Drilled**: run it on purpose when nothing is wrong; the drill PR updates "Last drilled". Never-drilled runbooks say so — that's a warning label.
- **Filename**: `<situation-slug>.md`; add a row to the folder README's trigger index.

## Index maintenance

- `docs/adr/README.md` must list every ADR in order with its current status.
- `docs/specs/README.md` must list every spec with its type and key ADRs.
- Feature specs under `docs/specs/<domain>/` are listed in the domain's `README.md`.
- Postmortems need no index — the date-prefixed filenames are the index.
- Runbooks are indexed in `docs/runbooks/README.md` with their trigger.
- When an ADR is superseded, update both the old ADR's Status and the index row.
- The `review-architecture` agent is responsible for the indices.

## What is NOT covered here

- File-level header comments → `documentation-style` skill.
- READMEs → `review-docs` agent.
- `.opencode/skill/` files → `review-skills` agent.
- Library choices (pino, sharp), config details, tooling setup → not ADR-worthy unless a README one-liner can't cover them.
