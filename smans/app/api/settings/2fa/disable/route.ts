// app/api/settings/2fa/disable/route.ts
import { NextResponse } from "next/server";
import { disable2FA } from "@/app/actions/settings/twoFactorAction";

export async function POST() {
  try {
    const result = await disable2FA();
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to disable 2FA";
    const status =
      message === "Unauthorized" || message.includes("deactivated")
        ? 401
        : message.includes("not currently")
          ? 400
          : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
