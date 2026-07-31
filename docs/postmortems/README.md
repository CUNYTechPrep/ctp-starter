# Postmortems — write-once bug history

A postmortem is the full story of a fixed bug: what was reported, what the
system actually did, the root cause, and what changed so it stays fixed.

Lifecycle rules:

- **Write-once.** Like ADRs, a postmortem is history — it is never edited
  after it lands. If later understanding changes, the new insight lives in
  the spec or a new postmortem, not in edits to the old one.
- **Arrives with the fix.** The PR that fixes the bug adds the postmortem in
  the same PR — root cause and all — and amends the spec the bug contradicted
  (or writes the spec whose absence the bug exposed).
- **May cite anything.** Unlike specs, postmortems are history documents:
  issue numbers, PR links, and dates belong here. This is where the one-way
  linkage rule *doesn't* apply, because nothing evergreen lives here.

Naming: `YYYY-MM-<slug>.md` (e.g. `2026-10-duplicate-on-double-submit.md`) —
chronological order is part of the story.

Start from [`_template.md`](_template.md).

A bug that was trivial — a typo, a one-line fix with no lesson — doesn't need
a postmortem. The bar: would the next person who hits something similar learn
from this? If yes, write it.
