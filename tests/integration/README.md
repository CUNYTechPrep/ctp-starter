# Integration tests

End-to-end tests against a real Postgres engine running in-process via PGlite
(Postgres-in-WebAssembly). No server, no Docker, no network.

| File | What it tests |
|---|---|
| `smoke.test.ts` | Boilerplate — verifies the PGlite door connects, inherited from `main` |
| `items.test.ts` | Items example — creates items, verifies `CREATED` events, scoping, soft-delete filtering |

**Note**: PGlite does not support `pg_notify`. SSE tests require a real
Postgres connection or mocking.