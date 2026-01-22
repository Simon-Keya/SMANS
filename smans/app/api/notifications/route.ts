import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import * as z from "zod";

const createNotificationSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").trim(),
  message: z.string().min(10, "Message must be at least 10 characters").trim(),
  recipientIds: z.array(z.string()).optional(), // if not provided, send to all
});

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session) {
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

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = createNotificationSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const { title, message, recipientIds } = parsed.data;

    let recipients;

    if (recipientIds && recipientIds.length > 0) {
      recipients = recipientIds;
    } else {
      // Send to all users (or filter by role if needed)
      const allUsers = await prisma.user.findMany({
        select: { id: true },
      });
      recipients = allUsers.map(u => u.id);
    }

    // Create notifications for each recipient
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