# Runbooks — what a human does when it breaks

Specs describe what the system does; a runbook describes what a **person
does** — the tested procedure for a situation: rolling back a bad deploy,
rotating a leaked secret, recovering a database.

Genre rules:

- **Written to be executed under stress.** Numbered steps, imperative mood,
  no prose. The reader is worried and in a hurry; every sentence that isn't
  a step is a cost. Destructive or irreversible steps are flagged **⚠** with
  what they destroy.
- **Evergreen, like specs.** The PR that changes a procedure (new deploy
  flow, renamed secret, different provider) updates the runbook in the same
  PR. A stale runbook is worse than none — it's confidently wrong at the
  worst possible moment.
- **Tested by drills.** A runbook's Verify is a rehearsal: run the procedure
  on purpose, periodically, when nothing is wrong. If it has never been
  drilled, the runbook says so at the top — that's a warning label.
- **Cites specs and postmortems; no issue state.** Link the spec that
  describes the system being operated on and any postmortem that motivated
  the procedure. Like specs, no issue numbers — history lives elsewhere.

Naming: `<situation-slug>.md` (e.g. `rollback-bad-deploy.md`,
`rotate-oauth-secret.md`). This README's index lists every runbook with its
trigger — keep it current.

Start from [`_template.md`](_template.md).

## Index

| Runbook | When |
|---|---|
| _(none yet — the first arrives with the deploy machinery)_ | |
