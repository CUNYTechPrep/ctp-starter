---
type: infrastructure
---
# Observability — production behavior is answerable

"It's slow" gets answered — what, for whom, since when — from dashboards, not
console.logs and redeploys.

## Behavior

- Logs are structured JSON (request id, user id, route, duration) via
  `packages/log` (pino). Local dev prints readable console output; production
  ships to App Insights. Same call sites — the transport is the seam.
- DB dependency timings are visible per request in App Insights.
- One slow request is traceable URL → handler → the exact query, dashboards only.
- A heavy seed (500+ records) + a load script in `/load` produce a repeatable
  performance report.

## Constraints & decisions

- Logs never contain secrets, tokens, or full request bodies.
- No alerting/SLOs at class scale (recorded, not forgotten).

## Verify

- The trace walkthrough reproduces on demand.
- Heavy seed + load script emit the report; numbers ride the PR that changes
  performance-relevant code.
