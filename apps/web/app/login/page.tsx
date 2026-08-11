// The sign-in page. A username is an account — no password, and the page
// says so out loud. Client Component: owns the form state, calls the API.
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username }),
    });
    setBusy(false);
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setError(data?.error?.message ?? "Something went wrong");
      return;
    }
    router.push("/");
    router.refresh();
  }

  return (
    <main className="space-y-8">
      <header>
        <h1 className="text-2xl font-bold">Sign in</h1>
        <p className="text-sm text-neutral-500">
          Pick a username. If it doesn&rsquo;t exist yet, it&rsquo;s yours.
        </p>
      </header>

      <form onSubmit={submit} className="flex gap-2">
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="username"
          aria-label="Username"
          autoFocus
          className="flex-1 rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none"
        />
        <button
          type="submit"
          disabled={busy || username.trim().length === 0}
          className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-40"
        >
          {busy ? "Signing in…" : "Sign in"}
        </button>
      </form>
      {error && <p className="text-sm text-red-600">{error}</p>}

      <p className="rounded-lg border border-dashed border-amber-300 bg-amber-50 p-4 text-sm text-amber-800">
        <strong>No password?</strong> Correct. This is <em>identity</em> without{" "}
        <em>authentication</em> — the app always knows who a request is for, but
        nobody has to prove who they are. Anyone can be anyone (try it: sign out,
        sign in as your neighbor). Real authentication is a later door; when it
        arrives, only the inside of <code>packages/auth</code> changes.
      </p>
    </main>
  );
}
