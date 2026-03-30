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

  // 🔐 Authorization - Updated to include ACCOUNTANT as well (recommended)
  if (
    !session?.user ||
    !["ADMIN", "TEACHER", "ACCOUNTANT"].includes(session.user.role)
  ) {
    throw new Error(
      "Unauthorized: Only admins, teachers, and accountants can send notifications"
    );
  }

  // 🧪 Validation
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
    // Fetch existing users to validate IDs
    const existingUsers = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true },
    });

    // ✅ FIXED: Explicit type for 'u' to remove implicit any error
    const validUserIds: string[] = existingUsers.map((u: { id: string }) => u.id);

    if (validUserIds.length === 0) {
      throw new Error("No valid recipients found");
    }

    // Create notifications in bulk
    const result = await prisma.notification.createMany({
      data: validUserIds.map((id: string) => ({
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

    return { 
      success: true, 
      count: result.count 
    };
  } catch (error: unknown) {
    const err = error as Error;

    logger.error("sendNotification error", {
      error: err.message,
      userIds,
      title,
    });

    throw new Error(err.message || "Failed to send notifications");
  }
}