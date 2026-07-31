# @project/services — Azure service adapters

Wraps the Azure SDKs for blob storage (images), queue storage (background jobs),
and Postgres `LISTEN`/`NOTIFY` (live events). Switches between local emulators
(Azurite) and production Azure based on environment variables.

**Boilerplate:** the queue adapter exposes a generic `enqueue(type, payload)`
helper. Example branches add typed helpers (`enqueueItemCreated`,
`enqueueThumbnail`) on top of these primitives.

## Public API

All exports come from `src/index.ts`:

### Queue (`src/queue.ts`)

| Export | What it does |
|---|---|
| `queueClient()` | Returns an Azure Queue client for the `jobs` queue |
| `enqueue(type, payload)` | Enqueues a generic job message |
| `JobMessage` | Generic type: `{ type: string; [key: string]: unknown }` |
| `encodeJobMessage(msg)` | Encodes a `JobMessage` as base64 JSON for the wire |
| `decodeJobMessage(text)` | Decodes a base64 wire message back into a `JobMessage` |

### Storage (`src/storage.ts`)

| Export | What it does |
|---|---|
| `uploadAttachment(entityId, filename, contentType, data)` | Uploads a blob; returns the blob name |
| `downloadAttachment(blobName)` | Downloads a blob; returns `{ data, contentType }` or `null` |
| `storageAvailable()` | Checks whether blob storage is reachable |
| `safeBlobName(entityId, filename)` | Creates a safe, namespaced blob name from a user-supplied filename |
| `MAX_ATTACHMENT_BYTES` | 5 MB — the attachment size cap |

### Notify (`src/notify.ts`)

| Export | What it does |
|---|---|
| `stagePayload(entityId, type)` | Returns a JSON string for `pg_notify` with a current timestamp |
| `onStage(entityId, handler)` | Subscribes to live events via Postgres `LISTEN` on the `events` channel; returns an unsubscribe function |

## Dependencies

- `@project/log` — pino logger
- `@azure/storage-blob` — Azure Blob SDK
- `@azure/storage-queue` — Azure Queue SDK
- `pg` — the PostgreSQL client driver (used by `notify.ts` for LISTEN)

## Consumers

- `apps/web` — via `@project/services`
- `apps/worker` — via `@project/services`

## The environment variable

```env
AZURE_STORAGE_CONNECTION_STRING=
```

Unset → Azurite (local emulator, started by `pnpm dev`). Set → real Azure
Storage. The `notify.ts` module uses `DATABASE_URL` (shared with `@project/db`).

## When to add a new adapter

A new external service (email, SMS, AI API) gets a new file in `src/` and a
re-export in `src/index.ts`. Keep the adapter pattern: the file wraps the
external SDK, exposes a clean async interface, and the rest of the codebase
never imports the SDK directly.