# <Situation, stated as the problem> (e.g. "A bad revision took traffic")

<!--
Runbook template. Written to be executed under stress: numbered steps,
imperative mood, no prose. Evergreen — the PR that changes the procedure
updates the runbook. Flag destructive steps with ⚠ and what they destroy.
If this runbook has never been drilled, say so in the Last drilled line.
-->

**Use when:** the one-sentence trigger — the symptom that brings someone here.
**Last drilled:** never | (updated by the PR that ran the drill)

## Before you start

- Access you need (portal role, CLI login, secret location) — verify it
  *now*, not at step 4.
- Blast radius: who or what this procedure affects while it runs.

## Steps

1. First step — one action, one observable result.
2. Next step.
3. ⚠ **Destructive step** — what it destroys, and the point of no return.
4. …

## Verify it worked

The observable end state — the health check green, the old revision serving,
the new secret accepted. Concrete commands or URLs, not "confirm it works."

## If this didn't work

Where this procedure's authority ends and what to do instead: the next
runbook, the escalation contact, or "stop and get help — do not improvise
past this line."

## Related

- Spec of the system being operated on: `docs/specs/…`
- Postmortem that motivated this procedure, if any: `docs/postmortems/…`
