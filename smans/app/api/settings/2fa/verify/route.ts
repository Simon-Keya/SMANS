// app/api/settings/2fa/verify/route.ts

import { authOptions } from "@/lib/auth/auth";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authenticator } from "otplib";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const { code, secret } = await request.json();

    if (!code || !secret) {
      return NextResponse.json(
        { error: "Missing code or secret" },
        { status: 400 }
      );
    }

    const isValid = authenticator.check(code, secret);

    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid code" },
        { status: 400 }
      );
    }

    // TODO (Production):
    // Encrypt secret and store in DB
    // Set twoFactorEnabled = true

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("2FA verify error:", error);

    return NextResponse.json(
      { error: "Failed to verify 2FA" },
      { status: 500 }
    );
  }
}