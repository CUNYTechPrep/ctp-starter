// Attachment upload and download. Files go to blob storage, not the database
// — the DB holds only the blob name. Upload queues the thumbnail pipeline and
// notifies the owner's event stream.

import { currentUserId } from "@project/auth";
import { prisma } from "@project/db";
import {
  uploadAttachment,
  downloadAttachment,
  storageAvailable,
  MAX_ATTACHMENT_BYTES,
  enqueue,
  stagePayload,
} from "@project/services";
import { log } from "@project/log";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

function ownedTodo(id: string, userId: string) {
  return prisma.todo.findFirst({ where: { id, userId } });
}

export async function POST(req: Request, ctx: Ctx) {
  const userId = await currentUserId();
  if (!userId) {
    return Response.json({ error: { code: "UNAUTHENTICATED", message: "Sign in first" } }, { status: 401 });
  }
  const { id } = await ctx.params;

  const todo = await ownedTodo(id, userId);
  if (!todo) {
    return Response.json({ error: { code: "NOT_FOUND", message: "No such todo" } }, { status: 404 });
  }

  if (!(await storageAvailable())) {
    return Response.json(
      { error: { code: "STORAGE_DOWN", message: "Blob storage unreachable — is Azurite running? `pnpm dev` starts it." } },
      { status: 503 }
    );
  }

  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return Response.json(
      { error: { code: "VALIDATION", message: "Send a non-empty 'file' field as multipart/form-data" } },
      { status: 400 }
    );
  }
  if (file.size > MAX_ATTACHMENT_BYTES) {
    return Response.json(
      { error: { code: "TOO_LARGE", message: "Attachments are capped at 5 MB" } },
      { status: 413 }
    );
  }
  if (!file.type.startsWith("image/")) {
    return Response.json(
      { error: { code: "UNSUPPORTED", message: "Only images for now — the thumbnail pipeline expects them" } },
      { status: 415 }
    );
  }
  // Block SVG — inline serving would create an origin XSS vector
  if (file.type === "image/svg+xml") {
    return Response.json(
      { error: { code: "UNSUPPORTED", message: "SVG images are not supported" } },
      { status: 415 }
    );
  }

  const blobName = await uploadAttachment(todo.id, file.name, file.type, await file.arrayBuffer());
  await prisma.$transaction(async (tx) => {
    await tx.todo.update({
      where: { id: todo.id },
      data: { attachmentName: blobName, thumbnailName: null },
    });
    await tx.todoEvent.create({ data: { todoId: todo.id, type: "THUMBNAIL_QUEUED" } });
    await tx.$executeRaw`SELECT pg_notify('events', ${stagePayload(userId, "THUMBNAIL_QUEUED", { todoId: todo.id, title: todo.title })})`;
  });
  log.info({ todoId: todo.id, blobName, bytes: file.size }, "attachment uploaded");

  // Fire-and-forget: the response doesn't wait for the queue.
  void enqueue("thumbnail.create", { todoId: todo.id, blobName });

  return Response.json({ todo: { id: todo.id, attachmentName: blobName } }, { status: 201 });
}

export async function GET(_req: Request, ctx: Ctx) {
  const userId = await currentUserId();
  if (!userId) {
    return Response.json({ error: { code: "UNAUTHENTICATED", message: "Sign in first" } }, { status: 401 });
  }
  const { id } = await ctx.params;

  const todo = await ownedTodo(id, userId);
  if (!todo?.attachmentName) {
    return Response.json({ error: { code: "NOT_FOUND", message: "No attachment" } }, { status: 404 });
  }

  const found = await downloadAttachment(todo.attachmentName);
  if (!found) {
    return Response.json({ error: { code: "NOT_FOUND", message: "Blob missing" } }, { status: 404 });
  }

  return new Response(new Uint8Array(found.data), {
    headers: {
      "Content-Type": found.contentType,
      "Content-Disposition": `inline; filename="${todo.attachmentName.split("/").pop()}"`,
      "X-Content-Type-Options": "nosniff",
    },
  });
}
