# @project/log — shared logger

A thin wrapper around pino. Every package and app imports from here instead of
instantiating their own logger — one format, one level, one place to configure.

## Public API

| Export | What it is |
|---|---|
| `log` | A pino logger instance. Use `log.info(...)`, `log.warn(...)`, `log.error(...)`, `log.debug(...)`. |

## Dependencies

- `pino` — fast, low-overhead Node.js logger

## Consumers

Every package and app. This is the lowest-level package — nothing depends on it.

## Configuration

```env
LOG_LEVEL=debug       # default: debug in dev, info in production
```

The logger writes structured JSON to stdout in all environments.

## Adding a new package

If you create a new package that needs logging, add `@project/log` as a
workspace dependency. Use `log.info(...)` with a structured first argument
(object) and a human-readable second argument (string message):
```ts
log.info({ itemId, userId }, "item created");
```