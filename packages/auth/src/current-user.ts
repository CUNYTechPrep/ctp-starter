// Dev identity stub: reads the current user from request headers, env var,
// or a fallback. Deliberately naive — replaced with real auth in Week 8.

import { headers } from "next/headers";

const FALLBACK = "demo-user";

export async function currentUserId(): Promise<string> {
  if (process.env.NODE_ENV === "production" && !process.env.ALLOW_DEV_IDENTITY) {
    throw new Error(
      "Dev identity stub is disabled in production. (Week 8 replaces this with real auth.)"
    );
  }
  const h = await headers();
  return h.get("x-user-id") ?? process.env.DEV_USER_ID ?? FALLBACK;
}