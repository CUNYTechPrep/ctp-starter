---
type: infrastructure
---
# <Subsystem name — what it pins down>

<!--
Infrastructure-spec template. An infra spec is a CROSS-CUTTING CONTRACT:
it lives on main, holds on every branch, and other specs lean on it by
reference. Like all specs it is evergreen — present tense, updated in place
by the PR that changes the behavior, no issue numbers or history inside.

The shape: a fixed opening (Purpose), a FREE-FORM MIDDLE, and a fixed
closing (Verify, Key ADRs). The middle takes whatever form fits the
content — see the existing specs for the range: a seam table (seams.md),
Boundaries + Error states tables (storage.md), a standards list (web.md),
a layout diagram with rules (monorepo.md). Common building blocks worth
reaching for: Where it lives, The contract (rules stated so a violation is
recognizable — if a rule has a number, the number IS the contract),
Boundaries (inside vs deliberately outside; local stand-in vs real service
and the env var that switches them), Error states (the table other specs
point at instead of re-deciding).
-->

## Purpose

One short paragraph: what this subsystem guarantees to the rest of the
system, and why it is cross-cutting rather than a feature.

<!-- ————— free-form middle: the form that fits the content ————— -->

## Verify

How a reader confirms this contract currently holds: the test command, plus
any drill (stop the service and watch, grep for a forbidden string).

## Key ADRs

The decisions that shaped this contract, linked — context and tradeoffs live
there, not here.
