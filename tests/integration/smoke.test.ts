import { describe, it, expect, beforeAll } from "vitest";

// Boilerplate integration smoke test: verifies the PGlite test door
// and the three-door Prisma client work with an empty schema.
// This test is inherited by all example branches.

type PrismaClient = import("@project/db").PrismaClient;
let prisma: PrismaClient;

beforeAll(async () => {
  process.env.PGLITE_DATA_DIR = "memory://";
  delete process.env.DATABASE_URL;
  // Boot PGlite WASM before the test runs so the test is instant
  const db = await import("@project/db");
  prisma = db.prisma;
}, 30000);

describe("prisma client (PGlite door)", () => {
  it("connects to an in-memory PGlite instance", async () => {
    const result = await prisma.$queryRaw<[{ "?column?": number }]>`SELECT 1`;
    expect(result[0]["?column?"]).toBe(1);
  });
});