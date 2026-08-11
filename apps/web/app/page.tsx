// The home page. Lists the signed-in user's todos and the create form.
// Server Component — queries the database and renders server-side; redirects
// to /login when there's no session.
import { currentUserId } from "@project/auth";
import { getUser, listTodos } from "@project/domain";
import { TodoForm } from "@/components/TodoForm";
import { TodoToggle } from "@/components/TodoToggle";
import { TodoAttachment } from "@/components/TodoAttachment";
import { Notifications } from "@/components/Notifications";
import { SignOutButton } from "@/components/SignOutButton";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function Home() {
  const userId = await currentUserId();
  if (!userId) redirect("/login");

  const user = await getUser(userId);
  if (!user) redirect("/login"); // stale cookie (e.g. after db:reset)

  const todos = await listTodos(userId);
  const open = todos.filter((t) => !t.done).length;

  return (
    <main className="space-y-8">
      <Notifications />

      <header className="flex items-baseline justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Todos</h1>
          <p className="text-sm text-neutral-500">
            {open === 0 ? "All done" : `${open} open`} · signed in as{" "}
            <code className="rounded bg-neutral-100 px-1">@{user.username}</code>
          </p>
        </div>
        <SignOutButton />
      </header>

      <TodoForm />

      {todos.length === 0 ? (
        <p className="rounded-lg border border-dashed border-neutral-300 p-6 text-center text-neutral-500">
          Nothing here yet. Add your first todo above — or run{" "}
          <code className="rounded bg-neutral-100 px-1">pnpm db:seed</code> and sign in as{" "}
          <code className="rounded bg-neutral-100 px-1">ada</code>.
        </p>
      ) : (
        <ul className="divide-y divide-neutral-200 rounded-lg border border-neutral-200">
          {todos.map((todo) => (
            <li key={todo.id} className="flex items-center gap-3 p-4">
              <TodoToggle todoId={todo.id} done={todo.done} />
              {todo.thumbnailName ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={`/api/todos/${todo.id}/thumbnail`}
                  alt=""
                  className="h-10 w-10 shrink-0 rounded object-cover"
                />
              ) : todo.attachmentName ? (
                <span
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-neutral-100 text-[10px] text-neutral-400"
                  title="Thumbnail pending — is the worker running? (pnpm worker)"
                >
                  …
                </span>
              ) : null}
              <div className="min-w-0 flex-1">
                <p className={`font-medium ${todo.done ? "text-neutral-400 line-through" : ""}`}>
                  {todo.title}
                </p>
                <TodoAttachment
                  todoId={todo.id}
                  attachmentName={todo.attachmentName}
                  thumbnailName={todo.thumbnailName}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
