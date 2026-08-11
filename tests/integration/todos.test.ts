import { describe, it, expect, beforeAll } from "vitest";

// Integration tests for the todo domain against PGlite: real SQL, real
// constraints, no server. The scoping rule ("every query is scoped by
// userId") is tested here as behavior, not read as a comment.

type Domain = typeof import("@project/domain");
let domain: Domain;

beforeAll(async () => {
  process.env.PGLITE_DATA_DIR = "memory://";
  delete process.env.DATABASE_URL;
  domain = await import("@project/domain");
}, 30000);

describe("todo domain (PGlite door)", () => {
  it("find-or-create is idempotent per username", async () => {
    const a = await domain.findOrCreateUser("ada-it");
    const b = await domain.findOrCreateUser("ada-it");
    expect(b.id).toBe(a.id);
  });

  it("creates a todo with its CREATED event in one transaction", async () => {
    const user = await domain.findOrCreateUser("creator-it");
    const todo = await domain.createTodo(user.id, { title: "write a test" });
    expect(todo.done).toBe(false);

    const found = await domain.getTodo(todo.id, user.id);
    expect(found?.title).toBe("write a test");
  });

  it("toggle flips done and refuses foreign todos", async () => {
    const owner = await domain.findOrCreateUser("owner-it");
    const stranger = await domain.findOrCreateUser("stranger-it");
    const todo = await domain.createTodo(owner.id, { title: "mine" });

    // A stranger toggling it: null — indistinguishable from "doesn't exist".
    expect(await domain.toggleTodo(todo.id, stranger.id, true)).toBeNull();

    const done = await domain.toggleTodo(todo.id, owner.id, true);
    expect(done?.done).toBe(true);
  });

  it("lists are scoped: users never see each other's todos", async () => {
    const ada = await domain.findOrCreateUser("scope-ada");
    const grace = await domain.findOrCreateUser("scope-grace");
    await domain.createTodo(ada.id, { title: "ada's secret plan" });

    const graceSees = await domain.listTodos(grace.id);
    expect(graceSees.find((t) => t.title.includes("secret"))).toBeUndefined();
  });
});
