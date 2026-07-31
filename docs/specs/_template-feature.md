---
type: feature
---
# <Behavior, stated as a fact about the system>

<!--
Feature-spec template. A spec is EVERGREEN: present tense, a description of
the system as it is. It is first drafted when the behavior is first built,
and from then on any PR that changes the behavior updates the spec in the
same PR. No issue numbers, no dates, no history — git holds history, and
linkage is one-way (issues cite specs, never the reverse). Every section
below is required; if one is genuinely empty, say why in one line rather
than deleting it.
-->

## Why
One short paragraph: the user-visible reason this behavior exists. No
implementation.

## Where it lives
Bulleted paths — packages and app routes this behavior touches. Follow the
boundaries in [monorepo.md](monorepo.md) (e.g. validation + queries in
`packages/domain/`, per ADR-0009).

## Behavior
Present-tense statements of what the system does. Include the unhappy paths:
validation failures, foreign/unknown ids (404, never 403 — see
[web.md](web.md)), signed-out access, and what is deliberately atomic.
Quantify where a number is the contract (query counts, time budgets).

## Examples
A small table of concrete cases — input/state → observable behavior. Cover
at least one happy path, one rejection, and one boundary. These become tests.

| State / input | Behavior |
|---|---|
| … | … |

## Verify
How a reader confirms this spec is currently true: the test command, plus
any manual drill (curl check, keyboard-only pass, stopped-database check).

## Constraints & decisions
Deliberate limits and the reason each exists — what the system does NOT do,
so the day that changes, the change is a decision and not an accident. Cite
ADRs where one governs.

## Out of scope
Adjacent behavior this spec deliberately does not cover, with a pointer to
the spec that owns it — or a note that it does not exist yet.
