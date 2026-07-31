// Seed script: creates the demo user and starter data.
// Safe to re-run once the data model exists.
// Run via: pnpm db:seed

import { prisma } from "@project/db";

async function main() {
  console.log("seed: no data model yet — nothing to do");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});