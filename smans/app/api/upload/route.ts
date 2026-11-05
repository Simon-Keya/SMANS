// app/api/upload/route.ts
// Authenticated file upload with size/MIME/extension checks.
// Local storage only; production should use object storage (Phase 4).

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";
import { UploadService } from "@/lib/services/uploadService";
import { applyRateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (session.user.isActive === false) {
      return NextResponse.json({ error: "Account deactivated" }, { status: 403 });
    }

    // Rate-limit by user
    try {
      await applyRateLimit(`upload:${session.user.id}`);
    } catch {
      return NextResponse.json(
        { error: "Rate limit exceeded. Try again later." },
        { status: 429 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const folder = (formData.get("folder") as string) || "uploads";

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const publicUrl = await UploadService.uploadFile(file, folder);

    return NextResponse.json({
      success: true,
      url: publicUrl,
      size: file.size,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to upload file";
    const status =
      message.includes("not allowed") ||
      message.includes("too large") ||
      message.includes("Empty") ||
      message.includes("Invalid")
        ? 400
        : 500;
    console.error("Upload error:", error);
    return NextResponse.json({ error: message }, { status });
  }
}

// Do not expose a public listing endpoint
export async function GET() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}
