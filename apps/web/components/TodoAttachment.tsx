// Client Component: attachment upload control. Picks an image, uploads it to
// blob storage, and follows the thumbnail pipeline live over the user's SSE
// stream (filtering for this todo's events).
"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

const STAGE_LABEL: Record<string, string> = {
  THUMBNAIL_QUEUED: "queued…",
  THUMBNAIL_STARTED: "processing…",
  THUMBNAIL_READY: "ready",
};

export function TodoAttachment({
  todoId,
  attachmentName,
  thumbnailName,
}: {
  todoId: string;
  attachmentName: string | null;
  thumbnailName: string | null;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [stage, setStage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Only listen while a thumbnail is pending. The stream carries every event
  // for the signed-in user; this component cares about one todo's.
  useEffect(() => {
    if (!attachmentName || thumbnailName) return;
    const es = new EventSource("/api/events");
    es.addEventListener("stage", (e) => {
      const n = JSON.parse((e as MessageEvent).data) as { type: string; todoId?: string };
      if (n.todoId !== todoId) return;
      setStage(n.type);
      if (n.type === "THUMBNAIL_READY") {
        es.close();
        router.refresh();
      }
    });
    return () => es.close();
  }, [todoId, attachmentName, thumbnailName, router]);

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setError(null);
    const form = new FormData();
    form.append("file", file);
    const res = await fetch(`/api/todos/${todoId}/attachment`, { method: "POST", body: form });
    setBusy(false);
    if (inputRef.current) inputRef.current.value = "";
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setError(data?.error?.message ?? "Upload failed");
      return;
    }
    setStage("THUMBNAIL_QUEUED");
    router.refresh();
  }

  return (
    <span className="flex items-center gap-2 text-xs">
      {attachmentName && (
        <a
          href={`/api/todos/${todoId}/attachment`}
          className="text-blue-600 underline underline-offset-2"
          download
        >
          {attachmentName.split("/").pop()}
        </a>
      )}
      {attachmentName && !thumbnailName && stage && stage !== "THUMBNAIL_READY" && (
        <span className="text-amber-600">{STAGE_LABEL[stage] ?? stage}</span>
      )}
      <label className="cursor-pointer rounded border border-neutral-300 px-2 py-0.5 text-neutral-600 hover:bg-neutral-50">
        {busy ? "Uploading…" : attachmentName ? "Replace image" : "Attach image"}
        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={onPick} disabled={busy} />
      </label>
      {error && <span className="text-red-600">{error}</span>}
    </span>
  );
}
