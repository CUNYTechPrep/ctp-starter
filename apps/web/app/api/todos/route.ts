// Todos list/create API. The full path from HTTP request to database:
// identity check, Zod validation, scoped query, mapped errors.

import { currentUserId } from "@project/auth";
import { CreateTodo, listTodos, createTodo } from "@project/domain";

export const dynamic = "force-dynamic";

const unauthenticated = () =>
  Response.json(
    { error: { code: "UNAUTHENTICATED", message: "Sign in first" } },
    { status: 401 }
  );

export async function GET() {
  const userId = await currentUserId();
  if (!userId) return unauthenticated();

  const todos = await listTodos(userId);
  return Response.json({ todos });
}

export async function POST(req: Request) {
  const userId = await currentUserId();
  if (!userId) return unauthenticated();

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json(
      { error: { code: "BAD_JSON", message: "Body must be valid JSON" } },
      { status: 400 }
    );
  }

  const parsed = CreateTodo.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: { code: "VALIDATION", message: parsed.error.issues[0]?.message ?? "Invalid input" } },
      { status: 400 }
    );
  }

  const todo = await createTodo(userId, parsed.data);
  return Response.json({ todo }, { status: 201 });
}
