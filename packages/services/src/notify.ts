// Live event subscription via Postgres LISTEN/NOTIFY. One shared connection
// fans out pg_notify payloads to all SSE streams in the web app.
// The channel is generic; this branch scopes events by entityId = userId, so
// one /api/events stream carries everything the signed-in user should hear.
import { log } from "@project/log";
import { Client } from "pg";

const CHANNEL = "events";

// The wire shape: who it's for (entityId), what happened (type), when (at),
// plus any extra fields the emitter wants the browser to have (todoId, title…).
export type StageEvent = { entityId: string; type: string; at: string } & Record<string, unknown>;

export function stagePayload(
  entityId: string,
  type: string,
  extra: Record<string, unknown> = {}
): string {
  return JSON.stringify({ entityId, type, at: new Date().toISOString(), ...extra });
}

let listener: Client | null = null;
type Handler = (n: StageEvent) => void;

export async function onStage(entityId: string, handler: Handler): Promise<() => void> {
  if (!listener) {
    const url = process.env.DATABASE_URL ?? "postgresql://postgres:postgres@127.0.0.1:5433/postgres";
    listener = new Client({ connectionString: url });
    await listener.connect();
    await listener.query(`LISTEN "${CHANNEL}"`);
    listener.on("notification", (msg) => {
      try {
        const n = JSON.parse(msg.payload ?? "{}");
        callbacks.forEach((cb) => cb(n));
      } catch { /* ignore malformed payloads */ }
    });
    log.info({ channel: CHANNEL }, "subscribed to pg_notify channel");
  }

  const cb = (n: StageEvent) => {
    if (n.entityId === entityId) handler(n);
  };
  callbacks.add(cb);
  return () => { callbacks.delete(cb); };
}

const callbacks = new Set<Handler>();
