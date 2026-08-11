// The background worker. Polls the jobs queue and processes messages — here,
// thumbnail generation. Runs as a separate process with its own database
// client; the web app finds out about progress the same way the browser
// does, through events.

import sharp from "sharp";
import {
  queueClient,
  decodeJobMessage,
  type JobMessage,
  downloadAttachment,
  uploadAttachment,
  stagePayload,
} from "@project/services";
import { prisma } from "@project/db";
import { log } from "@project/log";

const POLL_MS = 2000;
const THUMB_SIZE = 320;

async function handle(msg: JobMessage): Promise<void> {
  switch (msg.type) {
    case "thumbnail.create": {
      const todoId = typeof msg.todoId === "string" ? msg.todoId : null;
      const blobName = typeof msg.blobName === "string" ? msg.blobName : null;
      if (!todoId || !blobName) {
        log.warn({ msg }, "thumbnail.create missing todoId/blobName — skipping");
        return;
      }

      const todo = await prisma.todo.findUnique({
        where: { id: todoId },
        select: { userId: true, title: true },
      });
      if (!todo) {
        log.warn({ todoId }, "todo vanished before thumbnailing — skipping");
        return;
      }

      await prisma.$transaction(async (tx) => {
        await tx.todoEvent.create({ data: { todoId, type: "THUMBNAIL_STARTED" } });
        await tx.$executeRaw`SELECT pg_notify('events', ${stagePayload(todo.userId, "THUMBNAIL_STARTED", { todoId, title: todo.title })})`;
      });

      const original = await downloadAttachment(blobName);
      if (!original) {
        log.warn({ todoId, blobName }, "original blob missing — skipping");
        return;
      }

      const thumb = await sharp(original.data)
        .resize(THUMB_SIZE, THUMB_SIZE, { fit: "cover" })
        .webp({ quality: 80 })
        .toBuffer();

      const thumbName = await uploadAttachment(todoId, "thumb.webp", "image/webp", thumb.buffer as ArrayBuffer);

      await prisma.$transaction(async (tx) => {
        await tx.todo.update({ where: { id: todoId }, data: { thumbnailName: thumbName } });
        await tx.todoEvent.create({ data: { todoId, type: "THUMBNAIL_READY" } });
        await tx.$executeRaw`SELECT pg_notify('events', ${stagePayload(todo.userId, "THUMBNAIL_READY", { todoId, title: todo.title })})`;
      });

      log.info({ todoId, thumbName, bytes: thumb.length }, "thumbnail generated");
      return;
    }

    default: {
      log.warn({ type: msg.type }, "worker: unhandled message type — discarding");
      return;
    }
  }
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
