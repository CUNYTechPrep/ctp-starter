# <What happened, stated plainly>

<!--
Postmortem template. Write-once: this file is history and is never edited
after it lands. It arrives in the same PR as the fix. Unlike specs, history
documents cite freely — issue numbers, PR links, dates all belong here.
Blameless by default: name causes, not people.
-->

**Filed:** issue #NN · **Fixed:** PR #NN · **Spec:** `docs/specs/…`

## Report

What was observed, as reported — and the smallest reproduction.

## Expected vs actual

What the spec said (quote it) versus what the system did. If no spec covered
the behavior, say so — that absence is part of the root cause.

## Root cause

The actual mechanism, all the way down. "The query wasn't scoped" is a
symptom; *why* an unscoped query could exist and ship is the root cause.

## The fix

What changed, in a sentence or two. The diff is in the PR; this is the idea
of the fix, not the code.

## Why our defenses missed it

Which test, review step, or spec should have caught this and didn't — and
what that says about the defense, not just the bug.

## What changed beyond the fix

The lasting edits: spec amended (which section), test added (what it now
proves), guard or lint added. If the honest answer is "nothing," write that —
it's a finding.
