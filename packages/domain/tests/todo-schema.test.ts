// Boundary contracts: what the API accepts. If these change, the client and
// the server change together — that's why they live in one shared package.
import { describe, it, expect } from "vitest";
import { CreateTodo, ToggleTodo } from "../src/schemas/todo";
import { Username } from "../src/schemas/user";

describe("CreateTodo schema", () => {
  it("accepts a valid todo", () => {
    expect(CreateTodo.safeParse({ title: "Learn to read code" }).success).toBe(true);
  });

  it("trims and rejects empty titles", () => {
    expect(CreateTodo.safeParse({ title: "   " }).success).toBe(false);
    expect(CreateTodo.safeParse({}).success).toBe(false);
  });

  it("rejects a title over 200 characters", () => {
    expect(CreateTodo.safeParse({ title: "x".repeat(201) }).success).toBe(false);
  });
});

describe("ToggleTodo schema", () => {
  it("requires a boolean, not a truthy string", () => {
    expect(ToggleTodo.safeParse({ done: true }).success).toBe(true);
    expect(ToggleTodo.safeParse({ done: "true" }).success).toBe(false);
    expect(ToggleTodo.safeParse({}).success).toBe(false);
  });
});

describe("Username schema", () => {
  it("normalizes case and whitespace", () => {
    const r = Username.safeParse("  Ada ");
    expect(r.success).toBe(true);
    if (r.success) expect(r.data).toBe("ada");
  });

  it("rejects too-short, too-long, and hostile names", () => {
    expect(Username.safeParse("ab").success).toBe(false);
    expect(Username.safeParse("a".repeat(31)).success).toBe(false);
    expect(Username.safeParse("no spaces").success).toBe(false);
    expect(Username.safeParse("-starts-wrong").success).toBe(false);
    expect(Username.safeParse("<script>").success).toBe(false);
  });
});
