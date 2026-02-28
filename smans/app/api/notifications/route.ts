// app/api/notifications/route.ts
import { authOptions } from "@/lib/auth/auth"; // FIXED: correct path
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const createNotificationSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").trim(),
  message: z.string().min(10, "Message must be at least 10 characters").trim(),
  recipientIds: z.array(z.string()).optional(), // if not provided, send to all
});

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    return NextResponse.json({ success: true, data: notifications });
  } catch (error) {
    console.error("[GET_NOTIFICATIONS]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = createNotificationSchema.safeParse(body);

    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0];
      return NextResponse.json(
        { error: firstIssue?.message || "Invalid input" },
        { status: 400 }
      );
    }

    const { title, message, recipientIds } = parsed.data;

    let recipients: string[];

    if (recipientIds && recipientIds.length > 0) {
      // Validate provided recipient IDs exist
      const validRecipients = await prisma.user.findMany({
        where: { id: { in: recipientIds } },
        select: { id: true },
      });
      recipients = validRecipients.map(u => u.id);
    } else {
      // Send to all users
      const allUsers = await prisma.user.findMany({
        select: { id: true },
      });
      recipients = allUsers.map(u => u.id);
    }

    if (recipients.length === 0) {
      return NextResponse.json({ error: "No valid recipients found" }, { status: 400 });
    }

    // Create notifications for each recipient in a transaction
    const notifications = await prisma.$transaction(
      recipients.map(recipientId =>
        prisma.notification.create({
          data: {
            title,
            message,
            userId: recipientId,
          },
        })
      )
    );

    return NextResponse.json({ success: true, data: notifications }, { status: 201 });
  } catch (error) {
    console.error("[SEND_NOTIFICATION]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}