// Server-Sent Events: the signed-in user's live notification stream. One
// stream per browser tab; every event scoped to you (entityId = your userId)
// arrives as it happens, via Postgres LISTEN/NOTIFY. No polling anywhere.
//
// On connect it also replays the last minute of pipeline events from the
// database, so a thumbnail that finished while the tab was reconnecting
// still lands. Streams self-close after ~55s; EventSource reconnects.

import { currentUserId } from "@project/auth";
import { prisma } from "@project/db";
import { onStage, type StageEvent } from "@project/services";

export const dynamic = "force-dynamic";

const MAX_LIFETIME_MS = 55_000;
const HEARTBEAT_MS = 15_000;
const REPLAY_WINDOW_MS = 60_000;

const PIPELINE_TYPES = ["THUMBNAIL_QUEUED", "THUMBNAIL_STARTED", "THUMBNAIL_READY"] as const;

export async function GET(req: Request) {
  const userId = await currentUserId();
  if (!userId) {
    return Response.json({ error: { code: "UNAUTHENTICATED", message: "Sign in first" } }, { status: 401 });
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (n: StageEvent) =>
        controller.enqueue(encoder.encode(`event: stage\ndata: ${JSON.stringify(n)}\n\n`));

      controller.enqueue(encoder.encode(`retry: 1500\n\n`));

      let heartbeat: ReturnType<typeof setInterval> | undefined;
      let lifetime: ReturnType<typeof setTimeout> | undefined;
      let unsubscribe = () => {};

      const close = () => {
        unsubscribe();
        if (heartbeat) clearInterval(heartbeat);
        if (lifetime) clearTimeout(lifetime);
        try {
          controller.close();
        } catch {}
      };

      // Live events first, then replay — overlap beats a gap.
      unsubscribe = await onStage(userId, send);

      const recent = await prisma.todoEvent.findMany({
        where: {
          todo: { userId },
          type: { in: [...PIPELINE_TYPES] },
          createdAt: { gt: new Date(Date.now() - REPLAY_WINDOW_MS) },
        },
        orderBy: { createdAt: "asc" },
        include: { todo: { select: { id: true, title: true } } },
      });
      for (const e of recent) {
        send({
          entityId: userId,
          type: e.type,
          at: e.createdAt.toISOString(),
          todoId: e.todo.id,
          title: e.todo.title,
          replay: true,
        });
      }

      heartbeat = setInterval(() => controller.enqueue(encoder.encode(`: ping\n\n`)), HEARTBEAT_MS);
      lifetime = setTimeout(close, MAX_LIFETIME_MS);

      req.signal.addEventListener("abort", close);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
