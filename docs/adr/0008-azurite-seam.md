# ADR-0008: Azurite seam for local Azure dev

## Status

Accepted

## Context

The project depends on Azure Blob Storage (attachment bytes, thumbnails) and
Azure Storage Queue (background jobs). Running against real Azure during
development would require cloud credentials, network access, and cost.
The code needs to be testable offline with zero cloud setup.

## Decision

Use Azurite, Microsoft's official Azure Storage emulator, for local development.
Same Azure SDK code paths; Azurite replaces real Azure when
`AZURE_STORAGE_CONNECTION_STRING` is unset (defaulting to
`UseDevelopmentStorage=true`).

- The `packages/services/` package wraps both the Blob and Queue SDKs. The
  connection string is read from `AZURE_STORAGE_CONNECTION_STRING` at runtime.
- Azurite runs from npm as part of `pnpm dev` (alongside Postgres). Data lives
  in `.azurite/`.
- No code branches on `isLocal`. The SDK handles the emulator protocol
  transparently.
- The `storageAvailable()` health check probes Azurite's container metadata,
  returning `false` if Azurite isn't running. The upload route returns 503
  with a hint to start Azurite when it's down.

## Consequences

- **Easier**: zero cloud setup to develop features; the same SDK code paths
  are tested locally; switching to real Azure requires only setting
  `AZURE_STORAGE_CONNECTION_STRING`.
- **Harder**: Azurite is an extra process to manage; its emulation is not
  perfect (some advanced SDK features differ); data in `.azurite/` is
  ephemeral and can be nuked without losing anything real.
- **Accepted tradeoff**: no CI runs against real Azure. Integration tests
  that need blob storage run against Azurite in CI too. Breaking changes in
  the Azure SDK that only affect real endpoints are caught on deploy, not in
  CI.

## See also

- [ADR-0006](0006-blob-storage.md) — the blob storage pattern.
- `docs/specs/storage.md` — the local-vs-real Azure pattern in detail.
- `docs/specs/seams.md` — the unifying seam pattern; this ADR is one
  instance.