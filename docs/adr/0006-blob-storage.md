# ADR-0006: Bytes in blob storage, name in DB

## Status

Accepted

## Context

Items in the system can have an attached image (e.g., a photo). Storing binary
data in Postgres (`bytea` columns) is straightforward but wasteful: blobs bypass
Postgres's page layout and caching, bloat backups, and make the database the
bottleneck for serving media. The system also needs thumbnails, which are best
generated asynchronously outside the request path.

## Decision

Store attachment bytes in blob storage (Azure Blob Storage / Azurite locally)
and keep only the blob name in the database.

- The `item.attachmentName` column holds a namespaced key like
  `<item-id>/<sanitized-filename>`. `safeBlobName` strips path separators
  and non-alphanumeric characters, truncates to 100 chars.
- Uploads go through the Next.js API route (`POST /api/items/:id/attachment`),
  which validates MIME type and size (max 5 MB), writes to blob storage, then
  saves the returned blob name in a single Prisma transaction.
- Download (`GET /api/items/:id/attachment`) fetches from blob storage and
  streams back with the stored content type.
- Thumbnails are created asynchronously via `thumbnail.create` job on the queue
  — the worker downloads the original, resizes with sharp, uploads the result
  as a second blob, and stores the thumbnail's blob name in `item.thumbnailName`.

## Consequences

- **Easier**: Postgres stays lean (no binary data); backups are smaller; blob
  storage handles media serving and CDN integration natively.
- **Harder**: two storage systems to operate (DB + blob); deletion requires
  coordinating both; the route must validate blob storage is reachable before
  accepting uploads.
- **Accepted tradeoff**: the 5 MB cap is arbitrary. A real project may need
  chunked uploads for larger files. The current implementation buffers the
  entire file in memory before writing — fine for 5 MB, not fine for 500 MB.

## See also

- [ADR-0007](0007-pg-notify-sse.md) — how the client learns the thumbnail is ready.
- [ADR-0008](0008-azurite-seam.md) — how local blob storage emulation works.
- `docs/specs/eventing.md` — the end-to-end flow from upload to thumbnail.
- `docs/specs/storage.md` — the local-vs-real Azure pattern.