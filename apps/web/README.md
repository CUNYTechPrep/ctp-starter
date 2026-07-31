# @project/web — the Next.js app

The user-facing web application. A Next.js server-rendered React app.

**Boilerplate:** the home page shows a welcome message and a health-check link.
Example branches add their own pages, API routes, and Client Components.

## Public surface

All public routes are defined under `app/api/`:

| Route | Method | Purpose |
|---|---|---|
| `/` | GET | Home page — boilerplate welcome message |
| `/api/health` | GET | Health check — is the process alive? Can it reach the DB? |

## Dependencies

- `@project/db` — the Prisma client and generated types
- `@project/services` — queue, storage, and notify adapters
- `@project/domain` — Zod schemas and database queries (empty on main, populated on example branches)
- `@project/auth` — the `currentUserId()` dev identity stub
- `@project/log` — pino logger

## Consumers

Users with a browser. No other app or package imports from `@project/web`.

## Local dev

```bash
pnpm dev:web     # starts the Next.js dev server
```

The dev server expects a Postgres server and Azurite running alongside it.
Start everything together with `pnpm dev` from the repo root. The dev server
uses Turbopack (`--turbopack`).

## When it changes

- A new route goes in `app/api/`.
- A new Client Component goes in `components/`.
- Routes are Server Components. Forms and interactivity are Client Components.
  The split is Week 5's topic.