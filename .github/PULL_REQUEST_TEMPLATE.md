# What & why

<!-- One or two sentences. Link the issue: "Closes #NN". -->

Closes #

## Docs rode along

<!-- The rule: a PR that changes behavior changes the spec that describes it,
     in the same PR. Check what applies; delete what doesn't. -->

- [ ] **Spec** created or updated (`docs/specs/…`) — evergreen, present tense,
      no issue numbers or history inside the spec
- [ ] **ADR** added, if this makes a decision with real alternatives
      (`docs/adr/` — write-once; supersede, never edit)
- [ ] **Postmortem** moved in, if this fixes a bug worth remembering
      (`docs/postmortems/`)
- [ ] No doc changes needed because no behavior changed

## Verified

- [ ] `pnpm test` and `pnpm typecheck` pass locally
- [ ] The spec's **Verify** section is true after this change (ran the
      drill — curl check, keyboard pass, whatever it names)
- [ ] Every touched query is scoped by the current user; no client-supplied
      ids trusted; foreign resources 404

## For the reviewer

<!-- Where to start reading, what you're least sure about, what you'd ask
     about if you were reviewing this. Agent-drafted code: say what you
     checked by hand. -->
