// Sign-in: a username is an account. Validates, finds-or-creates the user,
// and starts the (unsigned — see packages/auth) session. No password: this
// route does identity, not authentication, and refuses to run in production
// builds for exactly that reason.

import { startSession } from "@project/auth";
import { SignIn, findOrCreateUser } from "@project/domain";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  if (process.env.NODE_ENV === "production" && !process.env.ALLOW_DEV_IDENTITY) {
    return Response.json(
      { error: { code: "AUTH_DISABLED", message: "Passwordless sign-in is disabled in production." } },
      { status: 403 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json(
      { error: { code: "BAD_JSON", message: "Body must be valid JSON" } },
      { status: 400 }
    );
  }

  const parsed = SignIn.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: { code: "VALIDATION", message: parsed.error.issues[0]?.message ?? "Invalid input" } },
      { status: 400 }
    );
  }

  const user = await findOrCreateUser(parsed.data.username);
  await startSession(user.id);

  return Response.json({ user: { id: user.id, username: user.username } });
}
