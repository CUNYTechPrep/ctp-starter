// Live event subscription via Postgres LISTEN/NOTIFY. One shared connection
// fans out pg_notify payloads to all SSE streams in the web app.
// Boilerplate — generic channel. Example branches use a specific channel
// name (e.g. "item_events") by editing the CHANNEL constant or accepting it
// as a parameter.
import { log } from "@project/log";
import { Client } from "pg";

const CHANNEL = "events";

export function stagePayload(entityId: string, type: string): string {
  return JSON.stringify({ entityId, type, at: new Date().toISOString() });
}

let listener: Client | null = null;
type Handler = (n: { entityId: string; type: string; at: string }) => void;

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

  const cb = (n: { entityId: string; type: string; at: string }) => {
    if (n.entityId === entityId) handler(n);
  };
  callbacks.add(cb);
  return () => { callbacks.delete(cb); };
}

const callbacks = new Set<Handler>();