// app/actions/notifications/sendNotification.ts
"use server";

import { authOptions } from "@/lib/auth/auth";
import { logger } from "@/lib/logger";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";

interface SendNotificationInput {
  userIds: string[];
  title: string;
  message: string;
}

interface SendNotificationOutput {
  success: boolean;
  count: number;
  error?: string;
}

export async function sendNotification({
  userIds,
  title,
  message,
}: SendNotificationInput): Promise<SendNotificationOutput> {
  const session = await getServerSession(authOptions);

  if (
    !session?.user ||
    !["ADMIN", "TEACHER"].includes(session.user.role)
  ) {
    throw new Error("Unauthorized: Only admins and teachers can send notifications");
  }

  // Input validation
  if (!userIds || userIds.length === 0) {
    throw new Error("At least one recipient is required");
  }

  if (!title?.trim()) {
    throw new Error("Notification title is required");
  }

  if (!message?.trim()) {
    throw new Error("Notification message is required");
  }

  if (title.length > 255) {
    throw new Error("Title must be 255 characters or fewer");
  }

  try {
    // Verify all target users actually exist
    const existingUsers = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true },
    });

    const validUserIds = existingUsers.map((u) => u.id);

    if (validUserIds.length === 0) {
      throw new Error("No valid recipients found");
    }

    const result = await prisma.notification.createMany({
      data: validUserIds.map((id) => ({
        userId: id,
        title: title.trim(),
        message: message.trim(),
        read: false,
      })),
      skipDuplicates: true,
    });

    logger.info("Notifications sent", {
      sentBy: session.user.id,
      recipientCount: result.count,
      title,
    });

    return { success: true, count: result.count };
  } catch (error: any) {
    logger.error("sendNotification error", { error: error.message });
    throw new Error(error.message || "Failed to send notifications");
  }
}