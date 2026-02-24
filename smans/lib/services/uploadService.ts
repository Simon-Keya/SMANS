// Simple local file upload (for photos, documents)
// In production use S3 / Cloudinary

import { writeFile } from "fs/promises";
import path from "path";

export class UploadService {
  static async uploadFile(file: File, folder: string = "uploads") {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const fileName = `${Date.now()}-${file.name}`;
    const filePath = path.join(process.cwd(), "public", folder, fileName);

    await writeFile(filePath, buffer);

    return `/${folder}/${fileName}`;
  }
}