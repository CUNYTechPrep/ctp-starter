// Serves the worker-generated thumbnail from blob storage. Proves the whole
// background pipeline (request → queue → worker → blob + DB) is working.

import { currentUserId } from "@project/auth";
import { prisma } from "@project/db";
import { downloadAttachment } from "@project/services";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const userId = await currentUserId();
  if (!userId) {
    return Response.json({ error: { code: "UNAUTHENTICATED", message: "Sign in first" } }, { status: 401 });
  }
  const { id } = await ctx.params;

  const todo = await prisma.todo.findFirst({ where: { id, userId } });
  if (!todo?.thumbnailName) {
    return Response.json(
      { error: { code: "NOT_FOUND", message: "No thumbnail (yet — is the worker running?)" } },
      { status: 404 }
    );
  }

  const found = await downloadAttachment(todo.thumbnailName);
  if (!found) {
    return Response.json({ error: { code: "NOT_FOUND", message: "Blob missing" } }, { status: 404 });
  }

  return new Response(new Uint8Array(found.data), {
    headers: { "Content-Type": found.contentType, "Cache-Control": "private, max-age=60" },
  });
}
