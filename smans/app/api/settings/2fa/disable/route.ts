// app/api/settings/2fa/disable/route.ts
import { authOptions } from "@/lib/auth/auth";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function POST() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // In production: clear twoFactorSecret from user
    // await prisma.user.update({
    //   where: { id: session.user.id },
    //   data: { twoFactorSecret: null },
    // });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to disable 2FA" }, { status: 500 });
  }
}