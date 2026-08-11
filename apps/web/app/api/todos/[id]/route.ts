// Toggle a todo done/undone. Scoped by the current user: a todo that isn't
// yours 404s — existence is not confirmed to non-owners.

import { currentUserId } from "@project/auth";
import { ToggleTodo, toggleTodo } from "@project/domain";

export const dynamic = "force-dynamic";

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const userId = await currentUserId();
  if (!userId) {
    return Response.json(
      { error: { code: "UNAUTHENTICATED", message: "Sign in first" } },
      { status: 401 }
    );
  }
  const { id } = await ctx.params;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json(
      { error: { code: "BAD_JSON", message: "Body must be valid JSON" } },
      { status: 400 }
    );
  }

  const parsed = ToggleTodo.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: { code: "VALIDATION", message: parsed.error.issues[0]?.message ?? "Invalid input" } },
      { status: 400 }
    );
  }

  const todo = await toggleTodo(id, userId, parsed.data.done);
  if (!todo) {
    return Response.json({ error: { code: "NOT_FOUND", message: "No such todo" } }, { status: 404 });
  }

  return Response.json({ todo });
}
