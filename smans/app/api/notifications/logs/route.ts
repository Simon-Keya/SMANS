import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const logs = await prisma.notificationLog.findMany({
      include: {
        notification: { select: { title: true } },
        recipient: { select: { name: true, email: true } },
      },
      orderBy: { sentAt: "desc" },
      take: 50,
    });

    return NextResponse.json({ success: true, data: logs });
  } catch (error) {
    console.error("[GET_NOTIFICATION_LOGS]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}