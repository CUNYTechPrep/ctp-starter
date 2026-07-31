// The jobs queue adapter. Wraps the Azure Storage Queue SDK so the web app
// and the worker can enqueue and consume messages without knowing the SDK shape.
// Boilerplate — generic queue seam. Example branches add typed helpers
// (enqueueItemCreated, enqueueThumbnail) on top of these primitives.
import { log } from "@project/log";
import { QueueClient } from "@azure/storage-queue";

const CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING ?? "UseDevelopmentStorage=true";
const QUEUE_NAME = "jobs";

export interface JobMessage {
  type: string;
  [key: string]: unknown;
}

export function encodeJobMessage(msg: JobMessage): string {
  return Buffer.from(JSON.stringify(msg)).toString("base64");
}

export function decodeJobMessage(text: string): JobMessage {
  const parsed = JSON.parse(Buffer.from(text, "base64").toString("utf8"));
  if (typeof parsed !== "object" || parsed === null) {
    throw new Error("queue: decoded message is not an object");
  }
  if (typeof parsed.type !== "string") {
    throw new Error("queue: message has no type field");
  }
  return parsed as JobMessage;
}

export function queueClient(): QueueClient {
  return new QueueClient(CONNECTION_STRING, QUEUE_NAME);
}

export async function enqueue(type: string, payload: Record<string, unknown>): Promise<void> {
  const q = queueClient();
  await q.createIfNotExists();
  const msg: JobMessage = { type, ...payload };
  await q.sendMessage(encodeJobMessage(msg));
  log.info({ type, queue: q.name }, "queued job");
}