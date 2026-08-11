// Client Component: the done checkbox. Optimistic enough for a demo — the
// PATCH round-trips, then the server-rendered list refreshes.
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function TodoToggle({ todoId, done }: { todoId: string; done: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function toggle() {
    setBusy(true);
    await fetch(`/api/todos/${todoId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ done: !done }),
    });
    setBusy(false);
    router.refresh();
  }

  return (
    <input
      type="checkbox"
      checked={done}
      onChange={toggle}
      disabled={busy}
      aria-label={done ? "Mark as not done" : "Mark as done"}
      className="h-4 w-4 shrink-0 cursor-pointer accent-neutral-900"
    />
  );
}
