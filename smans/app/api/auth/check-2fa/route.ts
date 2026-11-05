// app/api/auth/check-2fa/route.ts
// Password gate that reports whether 2FA is required without creating a session.
// Used by the login UI for a reliable two-step flow under NextAuth credentials limits.

import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { applyRateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const email =
      typeof body.email === "string" ? body.email.toLowerCase().trim() : "";
    const password = typeof body.password === "string" ? body.password : "";

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    try {
      await applyRateLimit(`login-check:${email}`);
    } catch {
      return NextResponse.json(
        { error: "Too many attempts. Try again later." },
        { status: 429 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        password: true,
        isActive: true,
        emailVerified: true,
        role: true,
        twoFactorEnabled: true,
      },
    });

    // Constant-ish response shape to avoid user enumeration on 2FA flag
    if (!user || !user.password) {
      return NextResponse.json(
        { ok: false, error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return NextResponse.json(
        { ok: false, error: "Invalid email or password" },
        { status: 401 }
      );
    }

    if (!user.isActive) {
      return NextResponse.json(
        { ok: false, error: "ACCOUNT_DEACTIVATED" },
        { status: 403 }
      );
    }

    if (!user.emailVerified && user.role !== "ADMIN") {
      return NextResponse.json(
        { ok: false, error: "EMAIL_NOT_VERIFIED" },
        { status: 403 }
      );
    }

    return NextResponse.json({
      ok: true,
      requires2FA: !!user.twoFactorEnabled,
    });
  } catch (error) {
    console.error("check-2fa error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
