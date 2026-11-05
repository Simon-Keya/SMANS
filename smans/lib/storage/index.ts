/**
 * Object storage abstraction.
 * Local disk when S3_BUCKET unset; S3-compatible when configured.
 */
import { mkdir, writeFile, unlink } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

export type StoredObject = {
  key: string;
  url: string;
  size: number;
  contentType: string;
};

export interface ObjectStorage {
  put(
    data: Buffer,
    opts: { folder?: string; filename?: string; contentType: string }
  ): Promise<StoredObject>;
  delete(key: string): Promise<void>;
  getPublicUrl(key: string): string;
}

class LocalStorage implements ObjectStorage {
  async put(
    data: Buffer,
    opts: { folder?: string; filename?: string; contentType: string }
  ): Promise<StoredObject> {
    const folder = (opts.folder || "uploads").replace(/[^a-zA-Z0-9_-]/g, "");
    const ext = path.extname(opts.filename || "") || "";
    const key = `${folder}/${randomUUID()}${ext}`;
    const full = path.join(process.cwd(), "public", key);
    await mkdir(path.dirname(full), { recursive: true });
    await writeFile(full, data);
    return {
      key,
      url: `/${key}`,
      size: data.length,
      contentType: opts.contentType,
    };
  }

  async delete(key: string): Promise<void> {
    const full = path.join(process.cwd(), "public", key);
    try {
      await unlink(full);
    } catch {
      /* ignore */
    }
  }

  getPublicUrl(key: string): string {
    return `/${key}`;
  }
}

class S3Storage implements ObjectStorage {
  private bucket = process.env.S3_BUCKET!;
  private region = process.env.S3_REGION || "auto";
  private publicBase =
    process.env.S3_PUBLIC_URL ||
    `https://${process.env.S3_BUCKET}.s3.amazonaws.com`;
  private endpoint = process.env.S3_ENDPOINT;

  async put(
    data: Buffer,
    opts: { folder?: string; filename?: string; contentType: string }
  ): Promise<StoredObject> {
    const key = `${opts.folder || "uploads"}/${randomUUID()}${path.extname(opts.filename || "")}`;
    const { S3Client, PutObjectCommand } = await import(
      "@aws-sdk/client-s3" as string
    );
    const client = new S3Client({
      region: this.region,
      ...(this.endpoint
        ? { endpoint: this.endpoint, forcePathStyle: true }
        : {}),
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY_ID!,
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
      },
    });
    await client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: data,
        ContentType: opts.contentType,
      })
    );
    return {
      key,
      url: this.getPublicUrl(key),
      size: data.length,
      contentType: opts.contentType,
    };
  }

  async delete(key: string): Promise<void> {
    try {
      const { S3Client, DeleteObjectCommand } = await import(
        "@aws-sdk/client-s3" as string
      );
      const client = new S3Client({
        region: this.region,
        credentials: {
          accessKeyId: process.env.S3_ACCESS_KEY_ID!,
          secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
        },
      });
      await client.send(
        new DeleteObjectCommand({ Bucket: this.bucket, Key: key })
      );
    } catch (e) {
      console.error("S3 delete failed", e);
    }
  }

  getPublicUrl(key: string): string {
    return `${this.publicBase.replace(/\/$/, "")}/${key}`;
  }
}

export function getObjectStorage(): ObjectStorage {
  if (process.env.S3_BUCKET && process.env.S3_ACCESS_KEY_ID) {
    return new S3Storage();
  }
  return new LocalStorage();
}
