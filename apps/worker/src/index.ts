// The background worker. Polls the jobs queue and processes messages.
// Boilerplate — minimal polling skeleton that logs received messages and
// discards them. Example branches add typed handlers (thumbnail generation,
// etc.) by matching on message.type and calling handle functions.
import { queueClient, decodeJobMessage, type JobMessage } from "@project/services";
import { log } from "@project/log";

const POLL_MS = 2000;

async function handle(msg: JobMessage): Promise<void> {
  log.warn({ type: msg.type, keys: Object.keys(msg) }, "worker: unhandled message type — discarding");
}

async function main() {
  const q = queueClient();
  await q.createIfNotExists();
  log.info({ queue: q.name, pollMs: POLL_MS }, "worker started — waiting for jobs (Ctrl+C to stop)");

  while (true) {
    const batch = await q.receiveMessages({ numberOfMessages: 10 });
    for (const m of batch.receivedMessageItems) {
      try {
        await handle(decodeJobMessage(m.messageText));
      } catch (err) {
        log.error({ err: String(err), raw: m.messageText.slice(0, 200) }, "job failed — discarding");
      }
      await q.deleteMessage(m.messageId, m.popReceipt);
    }
    if (batch.receivedMessageItems.length === 0) {
      await new Promise((r) => setTimeout(r, POLL_MS));
    }
  }
}

main().catch((err) => {
  log.error({ err: String(err) }, "worker crashed — are Azurite and the db server running? (`pnpm dev`)");
  process.exit(1);
});