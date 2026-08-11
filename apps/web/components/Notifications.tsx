// Client Component: live notifications. Subscribes to the signed-in user's
// SSE stream and shows a toast when background work finishes — the browser
// finds out because the server *pushed*, not because anything polled.
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Toast = { id: number; text: string };

let nextId = 1;

export function Notifications() {
  const router = useRouter();
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const es = new EventSource("/api/events");
    es.addEventListener("stage", (e) => {
      const n = JSON.parse((e as MessageEvent).data) as {
        type: string;
        title?: string;
        replay?: boolean;
      };
      if (n.type !== "THUMBNAIL_READY") return; // only completed work notifies
      const id = nextId++;
      setToasts((t) => [...t, { id, text: `Thumbnail ready — ${n.title ?? "your todo"}` }]);
      setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 5000);
      router.refresh();
    });
    // EventSource auto-reconnects; the server also recycles streams (~55s).
    return () => es.close();
  }, [router]);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2" role="status" aria-live="polite">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="rounded-lg border border-neutral-200 bg-white px-4 py-2 text-sm shadow-lg"
        >
          {t.text}
        </div>
      ))}
    </div>
  );
}
