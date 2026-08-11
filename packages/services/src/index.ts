// Re-exports the three service adapters: queue (background jobs), storage (blobs),
// and notify (live database events). Import from @project/services, never from the SDK directly.
export { queueClient, enqueue, type JobMessage, encodeJobMessage, decodeJobMessage } from "./queue";
export {
  uploadAttachment,
  downloadAttachment,
  storageAvailable,
  safeBlobName,
  MAX_ATTACHMENT_BYTES,
} from "./storage";
export { stagePayload, onStage, type StageEvent } from "./notify";
