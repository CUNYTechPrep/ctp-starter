# ADR-0003: Dev identity stub with env-flagged production guard

## Status

Accepted

## Context

The system needed a way to identify the current user in development before
real authentication was implemented. Production would eventually use OAuth,
JWTs, and middleware, but that work was deferred. The interim solution had to
be safe — the stub must never accidentally serve as an auth bypass in
production.

## Decision

Ship a deliberately naive `currentUserId()` function in `packages/auth/` that
reads from an `x-user-id` request header, then `DEV_USER_ID` env var, then
falls back to a hardcoded `demo-user`. The stub throws in production unless
`ALLOW_DEV_IDENTITY` is explicitly set.

- **Priority**: header → env var → hardcoded fallback. The header path is
  for development only — curl or Postman sets `x-user-id` to simulate any
  user. The `DEV_USER_ID` env var is for test suites. The fallback aligns
  with the seeded `demo-user`.
- **Production guard**: when `NODE_ENV === "production"` and
  `ALLOW_DEV_IDENTITY` is not set, the stub throws. This prevents accidental
  deployment that exposes the header bypass.
- **Future swap**: Week 8 replaces this entire package with real auth
  (OAuth, JWTs, middleware) that works for both the web app and the worker.
  The production guard ensures no production deployment can accidentally
  depend on the stub.

## Consequences

- **Easier**: zero auth setup for local dev; the seed script creates a
  `demo-user` that just works; API routes authenticate with a one-liner
  (`const userId = await currentUserId()`).
- **Harder**: the stub trusts whatever `x-user-id` value the client sends.
  In development that's intentional; in production it's a vulnerability.
  The throw guard mitigates but doesn't eliminate the risk of a misconfigured
  `ALLOW_DEV_IDENTITY`.
- **Accepted tradeoff**: the auth package is tightly coupled to Next.js
  (`next/headers`). The worker cannot use `currentUserId()` — it identifies
  itself differently (no user context in jobs). This also means the auth
  replacement is a focused rewrite of one package, not a cross-cutting
  change.

## See also

- `docs/specs/seams.md` — the unifying seam pattern; this ADR is one
  instance (dev stand-in → real implementation via explicit swap).
- `docs/specs/monorepo.md` — the packages/auth/ workspace and its
  sole consumer (apps/web).