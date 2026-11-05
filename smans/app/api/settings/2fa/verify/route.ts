// app/api/settings/2fa/verify/route.ts
import { NextResponse } from "next/server";
import { verify2FA } from "@/app/actions/settings/twoFactorAction";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const code = typeof body.code === "string" ? body.code : "";
    // Client-supplied secret is ignored; server uses stored pending secret
    const result = await verify2FA(code);
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to verify 2FA";
    const status =
      message === "Unauthorized" || message.includes("deactivated")
        ? 401
        : message.includes("Invalid") ||
            message.includes("required") ||
            message.includes("pending") ||
            message.includes("already")
          ? 400
          : 500;
    console.error("2FA verify error:", error);
    return NextResponse.json({ error: message }, { status });
  }
}
