// Identity without authentication: the session cookie stores the user id,
// plain and unsigned. Anyone can edit the cookie and become anyone — that is
// the point: this example demonstrates *identity* (who is this request for?)
// while *authentication* (prove it) stays a visible, later door. When real
// auth arrives it replaces the inside of this package and nothing else —
// every caller keeps calling currentUserId().

import { cookies } from "next/headers";

export const SESSION_COOKIE = "session";

// Null means "not signed in" — pages redirect to /login, API routes 401.
export async function currentUserId(): Promise<string | null> {
  const jar = await cookies();
  return jar.get(SESSION_COOKIE)?.value ?? null;
}

// Cookie writes are only allowed in Route Handlers / Server Actions
// (a Next.js rule). httpOnly keeps page scripts from reading the cookie —
// the one real security property it has. Signing it is real auth's job.
export async function startSession(userId: string): Promise<void> {
  const jar = await cookies();
  jar.set(SESSION_COOKIE, userId, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });
}

export async function endSession(): Promise<void> {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
}
