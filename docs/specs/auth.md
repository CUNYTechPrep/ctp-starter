---
type: infrastructure
---
# Identity — the auth subsystem

Who the current user is, and how every server entry learns it.

## Today: the dev identity stub

`packages/auth/` resolves the current user from the `x-user-id` header, then
`DEV_USER_ID`, then a fallback — **deliberately naive**, and guarded: it throws
in production unless `ALLOW_DEV_IDENTITY` is set. This is the auth seam's
local stand-in (see [seams](seams.md)) and a planted lesson.

## Target: session-derived identity, only

- Auth.js v5 + Prisma adapter, database sessions, GitHub OAuth (one provider).
- Public surface: landing, /login, /api/health, /api/auth/*. Everything else
  gated; signed-out API calls get 401, pages redirect to /login.
- Identity comes from the session **only**. The client never supplies a user
  id — no header, no param, no dev-only bypass: dev signs in like prod.
- First sign-in creates the user (name/avatar from GitHub).

The swap from stub to sessions is epic work — a `sign-in` ticket in the
app's feature epic executes it against this contract.

## Constraints & decisions

- One provider (GitHub); more is out of scope.
- After the swap, the string `x-user-id` appears nowhere in the codebase.
- Roles/admin, account deletion + export: future work with a privacy doc.

## Key decisions

- [ADR-0003](../adr/0003-dev-identity-stub.md) — why the stub exists and how it's guarded.
