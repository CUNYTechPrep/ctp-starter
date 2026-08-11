// Sign-out: clear the session cookie. That's all a session is here.

import { endSession } from "@project/auth";

export const dynamic = "force-dynamic";

export async function POST() {
  await endSession();
  return Response.json({ ok: true });
}
