---
type: infrastructure
---
# Storage — Spec

The project uses Azure Blob Storage for attachment bytes and thumbnails, and
Azure Storage Queue for background jobs. Locally, both are emulated by Azurite.

## Behavior

Every Azure dependency follows the same shape:

```
local dev:  Azurite (auto-started by pnpm dev)
production: Azure Blob/Queue (set AZURE_STORAGE_CONNECTION_STRING)
```

The connection string is the only switch. When unset, the Azure SDK defaults
to `UseDevelopmentStorage=true`, which connects to Azurite at `127.0.0.1:10000`
(blob) and `127.0.0.1:10001` (queue). No code branches on `isLocal`.

### Blob adapter (`packages/services/src/storage.ts`)
- Container: `attachments`.
- `uploadAttachment(entityId, filename, contentType, data)` → blob name.
- `downloadAttachment(blobName)` → `{ data, contentType }` or null.
- `safeBlobName(entityId, filename)` sanitizes the user filename and namespaces
  it under the entity ID: `<entityId>/<sanitized-name>`.
- `storageAvailable()` probes container metadata; returns `false` if Azurite is down.

### Queue adapter (`packages/services/src/queue.ts`)
- Queue name: `jobs`.
- `queueClient()` returns a client for the jobs queue.
- `enqueue(type, payload)` sends a generic job message.
- Messages are base64-encoded JSON. Use `encodeJobMessage`/`decodeJobMessage`
  to serialize/deserialize.
- Example branches add typed helpers (`enqueueItemCreated`, `enqueueThumbnail`)
  on top of these primitives.

### Notify adapter (`packages/services/src/notify.ts`)
- One shared `pg.Client` at module scope, running `LISTEN "events"`.
- `stagePayload(entityId, type)` produces the `{ entityId, type, at }` JSON
  string for `pg_notify`.
- `onStage(entityId, handler)` subscribes to live events; returns an
  unsubscribe function. Example branches use a different channel name
  (e.g., `item_events`) by editing the `CHANNEL` constant.

## Boundaries

- Blob storage does NOT delete old files when a new attachment replaces an
  existing one — the DB entry is updated but the old blob lingers.
- The queue does NOT guarantee delivery order (Azure Storage Queue is
  at-least-once, not FIFO).
- This package does NOT generate thumbnails — that's the worker's job.
- The notify service does NOT authenticate or filter by user — every SSE
  stream receives all notifications on the channel; the callback set filters
  by entityId.

## Error states

| Failure | What happens |
|---|---|
| Azurite is not running | `storageAvailable()` returns `false`. The upload route returns **503** with a hint. All blob/queue operations will fail with a connection error |
| Blob not found on download | `downloadAttachment()` returns `null`; the GET route returns **404** |
| `AZURE_STORAGE_CONNECTION_STRING` is wrong (production) | SDK throws a connection error; blob/queue operations fail |
| Queue message is malformed | Worker skips the message (`log.warn()). The message stays on the queue |
| File sanitization produces an empty name | `safeBlobName` falls back to `"file"` as the name |

## Env vars

| Var | Default | Effect |
|---|---|---|
| `AZURE_STORAGE_CONNECTION_STRING` | `UseDevelopmentStorage=true` | Switches Azurite ↔ real Azure |

## Testing

- Blob operations can be tested against Azurite in CI.
- Queue operations: sending a message and receiving it back through Azurite
  validates the full round-trip.
- Unit tests for individual functions (`safeBlobName`, `storageAvailable`) do
  not need Azurite.

## Key decisions

- [ADR-0006](../adr/0006-blob-storage.md) — blob storage for attachments.
- [ADR-0008](../adr/0008-azurite-seam.md) — Azurite seam for local dev.
- [ADR-0005](../adr/0005-pglite-tests.md) — PGlite for tests (the database side of the seam pattern).