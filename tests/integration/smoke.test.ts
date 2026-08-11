import { describe, it, expect, beforeAll } from "vitest";

// Integration smoke test: verifies the PGlite test door and the three-door
// Prisma client boot, and that migrations applied (the schema is queryable).

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

  it("applied the migrations on boot", async () => {
    // If 0001_init didn't run, this throws: no Todo table.
    expect(await prisma.todo.count()).toBe(0);
  });
});
