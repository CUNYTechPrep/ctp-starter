// Database queries for todos. Every query is scoped by userId — no exceptions.
// A todo and its event are written in a single transaction, always.
import { prisma } from "@project/db";
import type { CreateTodoInput } from "../schemas/todo";

export function listTodos(userId: string) {
  return prisma.todo.findMany({
    where: { userId },
    orderBy: [{ done: "asc" }, { createdAt: "desc" }],
  });
}

export function getTodo(id: string, userId: string) {
  return prisma.todo.findFirst({ where: { id, userId } });
}

export async function createTodo(userId: string, input: CreateTodoInput) {
  return prisma.$transaction(async (tx) => {
    const todo = await tx.todo.create({ data: { userId, title: input.title } });
    await tx.todoEvent.create({ data: { todoId: todo.id, type: "CREATED" } });
    return todo;
  });
}

// Returns null when the todo doesn't exist OR isn't yours — callers turn
// that into a 404 either way (existence is not confirmed to non-owners).
export async function toggleTodo(id: string, userId: string, done: boolean) {
  return prisma.$transaction(async (tx) => {
    const todo = await tx.todo.findFirst({ where: { id, userId } });
    if (!todo) return null;
    const updated = await tx.todo.update({ where: { id: todo.id }, data: { done } });
    await tx.todoEvent.create({
      data: { todoId: todo.id, type: done ? "COMPLETED" : "REOPENED" },
    });
    return updated;
  });
}
