// Health check endpoint. Probes that the process is alive and the database
// is reachable. Called by Azure's load balancer probes in production (Week 10).

import { prisma } from "@project/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return Response.json({ status: "ok", db: "ok" });
  } catch {
    return Response.json({ status: "ok", db: "error" }, { status: 503 });
  }
}