# ADR-0007: Postgres LISTEN/NOTIFY for live SSE

## Status

Accepted

## Context

The browser needed live updates for the thumbnail pipeline: when a user uploads
an image, the client should see "queued → processing → ready" without polling.
The project had no message broker or WebSocket infrastructure. Adding one for
this single feature was disproportionate.

## Decision

Use Postgres `LISTEN`/`NOTIFY` to push stage transitions from the server to
the browser via Server-Sent Events.

- Every database write that produces a stage change is wrapped in a Prisma
  transaction that also calls `pg_notify('item_events', stagePayload(...))`.
  The notification fires only if the transaction commits — no phantom events.
- A shared `pg.Client` connection at module scope runs `LISTEN "item_events"`
  (created lazily on the first `onStage` call). All SSE streams share this
  one connection.
- The notification payload is `{ itemId, type, at }`. A Set of per-client
  callbacks filters by `itemId` — each SSE stream registers a callback that
  only fires for its item.
- The SSE route (`GET /api/items/:id/events`) also replays recent `ItemEvent`
  rows since the `Last-Event-ID` cursor, so a reconnecting client doesn't miss
  the current state.
- A 55-second hard lifetime cap and 15-second heartbeat force clients to
  reconnect, preventing accumulated stale connections.

## Consequences

- **Easier**: zero infrastructure beyond Postgres; no WebSocket server, no
  broker, no Redis pub/sub; the commit-and-notify atomicity via `$executeRaw`
  inside the Prisma transaction.
- **Harder**: notifications are fire-and-replace — if the payload `itemId`
  matches the same channel, Postgres keeps only the latest. This project
  avoids the issue by using a single channel with the `itemId` inside the
  payload (not as the channel name).
- **Accepted tradeoff**: the shared LISTEN connection is a module-level
  singleton. In Next.js dev mode with HMR this can be fragile; the intent
  is "one per process." At scale (>1000 concurrent SSE streams), the Set
  iterates all callbacks on every notification — a Map keyed by `itemId`
  would be the natural next step.

## See also

- [ADR-0006](0006-blob-storage.md) — the upload flow that triggers notifications.
- `docs/specs/eventing.md` — the end-to-end flow including the SSE
  reconnect/replay logic.