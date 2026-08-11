// Database queries for users. Sign-in is find-or-create: a username IS an
// account. The unique index on username makes the upsert race-safe.
import { prisma } from "@project/db";

export function getUser(id: string) {
  return prisma.user.findUnique({ where: { id } });
}

export function findOrCreateUser(username: string) {
  return prisma.user.upsert({
    where: { username },
    update: {},
    create: { username },
  });
}
