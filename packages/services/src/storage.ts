// The blob storage adapter. Uploads and downloads attachments from Azure Blob
// Storage (or Azurite locally). Files live in blob storage, not in the database.
import { log } from "@project/log";
import { BlobServiceClient } from "@azure/storage-blob";

const CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING ?? "UseDevelopmentStorage=true";
const CONTAINER = "attachments";
export const MAX_ATTACHMENT_BYTES = 5 * 1024 * 1024; // 5 MB

export async function storageAvailable(): Promise<boolean> {
  try {
    const client = BlobServiceClient.fromConnectionString(CONNECTION_STRING);
    await client.getContainerClient(CONTAINER).getProperties();
    return true;
  } catch {
    return false;
  }
}

// Creates a safe blob name from an item id and filename.
export function safeBlobName(itemId: string, filename: string): string {
  const safe = filename
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .replace(/\.\./g, "")
    .replace(/[/\\]/g, "_")
    .slice(0, 100)
    || "file";
  return `${itemId}/${safe}`;
}

export async function uploadAttachment(
  itemId: string,
  filename: string,
  contentType: string,
  data: ArrayBuffer
): Promise<string> {
  const blobName = safeBlobName(itemId, filename);
  const client = BlobServiceClient.fromConnectionString(CONNECTION_STRING);
  const blockBlob = client.getContainerClient(CONTAINER).getBlockBlobClient(blobName);
  await blockBlob.uploadData(data, { blobHTTPHeaders: { blobContentType: contentType } });
  log.info({ blobName, bytes: data.byteLength }, "uploaded blob");
  return blobName;
}

export async function downloadAttachment(
  blobName: string
): Promise<{ data: Uint8Array; contentType: string } | null> {
  try {
    const client = BlobServiceClient.fromConnectionString(CONNECTION_STRING);
    const blockBlob = client.getContainerClient(CONTAINER).getBlockBlobClient(blobName);
    const res = await blockBlob.download(0);
    const data = new Uint8Array(await streamToBuffer(res.readableStreamBody!));
    return { data, contentType: res.contentType ?? "application/octet-stream" };
  } catch {
    return null;
  }
}

async function streamToBuffer(stream: NodeJS.ReadableStream): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of stream) chunks.push(Buffer.from(chunk));
  return Buffer.concat(chunks);
}