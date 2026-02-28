// app/api/settings/2fa/enable/route.ts

import { authOptions } from "@/lib/auth/auth";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authenticator } from "otplib";

export async function POST() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    // Generate proper Base32 secret (recommended)
    const secret = authenticator.generateSecret();

    // Generate otpauth URL
    const otpauth = authenticator.keyuri(
      session.user.email ?? session.user.id,
      "SMANS",
      secret
    );

    // TODO (Production):
    // Save encrypted secret in DB before enabling

    return NextResponse.json({
      success: true,
      secret,
      otpauth,
    });
  } catch (error) {
    console.error("2FA enable error:", error);

    return NextResponse.json(
      { error: "Failed to generate 2FA secret" },
      { status: 500 }
    );
  }
}