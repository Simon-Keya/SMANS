import { getObjectStorage } from "@/lib/storage";

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

const ALLOWED_EXTENSIONS = new Set([
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".gif",
  ".pdf",
  ".doc",
  ".docx",
]);

function getSafeExtension(originalName: string): string {
  const ext =
    (originalName || "").toLowerCase().match(/\.[a-z0-9]+$/)?.[0] || "";
  if (!ALLOWED_EXTENSIONS.has(ext)) {
    throw new Error(`File extension not allowed: ${ext || "(none)"}`);
  }
  return ext;
}

export class UploadService {
  static async uploadFile(
    file: File,
    folder: string = "uploads"
  ): Promise<string> {
    if (!file || typeof file.arrayBuffer !== "function") {
      throw new Error("Invalid file");
    }
    if (file.size <= 0) throw new Error("Empty file");
    if (file.size > MAX_FILE_SIZE_BYTES) {
      throw new Error(
        `File too large (max ${MAX_FILE_SIZE_BYTES / 1024 / 1024} MB)`
      );
    }
    const mime = (file.type || "").toLowerCase();
    if (!ALLOWED_MIME_TYPES.has(mime)) {
      throw new Error(`MIME type not allowed: ${mime || "(unknown)"}`);
    }
    const ext = getSafeExtension(file.name);
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const storage = getObjectStorage();
    const stored = await storage.put(buffer, {
      folder,
      filename: `file${ext}`,
      contentType: mime,
    });
    return stored.url;
  }
}
