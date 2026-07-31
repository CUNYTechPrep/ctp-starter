---
type: infrastructure
---
# Deploy — merges to main ship themselves

Shipping is a merge, not a ritual performed by someone who remembers the steps.

## Behavior

- CI builds the web app's image (the **only** place images are built) and
  pushes to GHCR. Contributor laptops never need docker.
- On main: deploy workflow creates a new Azure Container Apps revision at 0%
  traffic → smoke-tests `GET /api/health` (must say `db: "ok"`) → promotes to
  100%. A failing smoke test means traffic never shifts.
- Secrets live in Container Apps settings; `.env.example` documents every
  variable; probes point at /api/health.
- `PG_POOL_MAX=1` against the shared class Postgres — connection etiquette.

## Error states

| Failure | What happens |
|---|---|
| broken env in a new revision | smoke fails; old revision keeps traffic |
| image build fails | CI red; nothing deploys |

## Constraints & decisions

- GHCR, not ACR — free for public repos.
- Container Apps consumption, min replicas 0 (scale-to-zero is the default
  posture); anything needing always-on gets its own discussion.
- The worker deploys separately (as a Functions timer when precomputation
  arrives — an epic ticket, not part of the base deploy).

## Verify

- The broken-revision drill, run on purpose periodically.
- A one-line PR reaches the live URL in < 10 minutes, untouched by hands.
