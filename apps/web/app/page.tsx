// Boilerplate home page. Shows the current dev user and a link to the health
// check endpoint. Example branches replace this with their own app-specific UI.
import { currentUserId } from "@project/auth";

export const dynamic = "force-dynamic";

export default async function Home() {
  const userId = await currentUserId();

  return (
    <main className="space-y-8">
      <header>
        <h1 className="text-2xl font-bold">Starter Skeleton</h1>
        <p className="text-sm text-neutral-500">
          Signed in as <code className="rounded bg-neutral-100 px-1">{userId}</code> (dev
          identity stub — real auth arrives in Week 8)
        </p>
      </header>

      <section className="rounded-lg border border-neutral-200 bg-neutral-50 p-6">
        <p className="mb-4 text-neutral-600">
          Welcome to the starter skeleton. The database is connected and ready.
          Example branches add their own pages, API routes, and background workers here.
        </p>
        <a
          href="/api/health"
          className="text-blue-600 underline underline-offset-2 hover:text-blue-800"
        >
          Check health &rarr;
        </a>
      </section>
    </main>
  );
}