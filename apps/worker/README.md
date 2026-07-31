# @project/worker — the background worker

A long-running process that polls the jobs queue and processes messages. Runs
alongside the web app; in production it becomes an Azure Function (Week 12).

**Boilerplate:** minimal polling skeleton that logs and discards any message.
Example branches add typed handlers (thumbnail generation, data processing)
by matching on `message.type`.

## Dependencies

- `@project/db` — the Prisma client (for writing data)
- `@project/services` — queue client (polling) and storage (blob upload/download)
- `@project/log` — pino logger

## Consumers

No one imports the worker — it's a standalone entry point.

## Local dev

```bash
pnpm worker     # starts the polling loop
```

Requires Azurite (the queue) and the database server running. Start everything
together with `pnpm dev` from the repo root.

## Adding a handler

In `src/index.ts`, add a `case` to the `handle()` switch matching on
`msg.type`. Import the packages you need (`@project/db`, `@project/services`)
and implement the job logic.