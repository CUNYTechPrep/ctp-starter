// Validation schemas for todo inputs. They run at the API boundary before
// any database operation — invalid shapes never reach the database.
import { z } from "zod";

export const CreateTodo = z.object({
  title: z.string().trim().min(1, "Title is required").max(200, "Keep it under 200 characters"),
});

export const ToggleTodo = z.object({
  done: z.boolean(),
});

export type CreateTodoInput = z.infer<typeof CreateTodo>;
export type ToggleTodoInput = z.infer<typeof ToggleTodo>;
