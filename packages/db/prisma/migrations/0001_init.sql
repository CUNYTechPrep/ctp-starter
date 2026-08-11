-- 0001_init — the complete schema, day one.
-- Matches prisma/schema.prisma exactly (Prisma DDL conventions).
-- Regenerate after schema changes with:
--   npx prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script

-- Enums
CREATE TYPE "TodoEventType" AS ENUM ('CREATED', 'COMPLETED', 'REOPENED', 'THUMBNAIL_QUEUED', 'THUMBNAIL_STARTED', 'THUMBNAIL_READY');

-- Tables
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Todo" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "done" BOOLEAN NOT NULL DEFAULT false,
    "attachmentName" TEXT,
    "thumbnailName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Todo_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "TodoEvent" (
    "id" TEXT NOT NULL,
    "todoId" TEXT NOT NULL,
    "type" "TodoEventType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TodoEvent_pkey" PRIMARY KEY ("id")
);

-- Indexes
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
CREATE INDEX "Todo_userId_done_idx" ON "Todo"("userId", "done");
CREATE INDEX "Todo_userId_createdAt_idx" ON "Todo"("userId", "createdAt");
CREATE INDEX "TodoEvent_todoId_createdAt_idx" ON "TodoEvent"("todoId", "createdAt");

-- Foreign keys
ALTER TABLE "Todo" ADD CONSTRAINT "Todo_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TodoEvent" ADD CONSTRAINT "TodoEvent_todoId_fkey"
    FOREIGN KEY ("todoId") REFERENCES "Todo"("id") ON DELETE CASCADE ON UPDATE CASCADE;
