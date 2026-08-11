# @project/auth — identity / auth

Identity without authentication.

Sign-in is a username — no password, no verification. `/login` finds or
creates the `User` row and puts its id in an **unsigned, httpOnly cookie**.
`currentUserId()` reads it back. That's the entire mechanism.

## Public API

All exports come from `src/index.ts`:

| Export | What it does |
|---|---|
| `currentUserId()` | The signed-in user's id, or `null`. Pages redirect to `/login` on null; API routes return 401. |
| `startSession(userId)` | Sets the session cookie. Route Handlers / Server Actions only (Next.js cookie rule). |
| `endSession()` | Clears the session cookie. |
| `SESSION_COOKIE` | The cookie's name (`"session"`). |

## Why this is deliberately not secure

Anyone can edit the cookie and become anyone. The example keeps that
property on purpose, because it separates two ideas this app needs you to
keep separate:

- **Identity** — *who is this request for?* Every query in the app is scoped
  by `currentUserId()`. That discipline is real and enforced today.
- **Authentication** — *prove you are that user.* Absent today, by design.
  When it arrives (OAuth, sessions with signatures, middleware), it replaces
  the inside of this package — and because every page and route calls
  `currentUserId()` and nothing else, the call sites don't change. The seam
  is the function boundary.

## Try the obvious attack

Sign in, open devtools → Application → Cookies, change `session` to another
user's id, refresh. You're them. Two things to notice afterwards: the login
route refuses to run in production builds (`NODE_ENV === "production"`)
unless `ALLOW_DEV_IDENTITY` is set — the same guard the old header stub had —
and nothing in the app ever trusts a user id arriving in a request body or
URL. Scoping by the session's user id is what keeps a forged id from being
an *escalation*: you can claim to be someone, but every query still only
shows you what that someone owns.

## Consumers

- `apps/web` — every page and API route
