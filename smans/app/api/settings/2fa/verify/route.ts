// app/api/settings/2fa/verify/route.ts
import { authOptions } from "@/lib/auth/auth";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import otplib from "otplib";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { code, secret } = await request.json();

    if (!code || !secret) {
      return NextResponse.json({ error: "Missing code or secret" }, { status: 400 });
    }

    const isValid = otplib.authenticator.check(code, secret);

    if (!isValid) {
      return NextResponse.json({ error: "Invalid code" }, { status: 400 });
    }

    // In production: save secret to user record (encrypted)
    // await prisma.user.update({
    //   where: { id: session.user.id },
    //   data: { twoFactorSecret: encrypt(secret) },
    // });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to verify 2FA" }, { status: 500 });
  }
}