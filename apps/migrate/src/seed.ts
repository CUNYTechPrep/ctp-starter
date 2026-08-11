// Seeds two demo users and starter todos. Two users on purpose: sign in as
// each and see different data — that's the scoping rule made visible.
// Safe to re-run: users upsert by username, todos only created when absent.
// Run via: pnpm db:seed

import { prisma } from "@project/db";

const SEEDS: Record<string, string[]> = {
  ada: [
    "Read the schema with AI — then verify one claim by running code",
    "Attach an image to a todo and watch the pipeline (pnpm worker)",
    "Open your first PR (change this seed data!)",
  ],
  grace: [
    "Sign in as ada — notice you can't see her todos from here",
    "Trace the /api/todos POST in the network tab",
  ],
};

async function main() {
  for (const [username, titles] of Object.entries(SEEDS)) {
    const user = await prisma.user.upsert({
      where: { username },
      update: {},
      create: { username },
    });

    const existing = await prisma.todo.count({ where: { userId: user.id } });
    if (existing > 0) {
      console.log(`seed: @${username} already has ${existing} todos, leaving them alone`);
      continue;
    }

    for (const title of titles) {
      const todo = await prisma.todo.create({ data: { userId: user.id, title } });
      await prisma.todoEvent.create({ data: { todoId: todo.id, type: "CREATED" } });
    }
    console.log(`seed: created ${titles.length} todos for @${username}`);
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
