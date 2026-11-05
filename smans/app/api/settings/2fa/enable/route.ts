// app/api/settings/2fa/enable/route.ts
import { NextResponse } from "next/server";
import { enable2FA } from "@/app/actions/settings/twoFactorAction";

export async function POST() {
  try {
    const result = await enable2FA();
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to generate 2FA secret";
    const status =
      message === "Unauthorized" || message.includes("deactivated")
        ? 401
        : message.includes("already enabled")
          ? 400
          : 500;
    console.error("2FA enable error:", error);
    return NextResponse.json({ error: message }, { status });
  }
}
