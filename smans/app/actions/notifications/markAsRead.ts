"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/session";

/**
 * Mark a notification as read. Only the owner (or admin) may do so.
 */
export async function markAsRead(notificationId: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  if (!notificationId?.trim()) throw new Error("Notification ID is required");

  const notification = await prisma.notification.findUnique({
    where: { id: notificationId },
    select: { userId: true },
  });

  if (!notification) throw new Error("Notification not found");

  if (notification.userId !== user.id && user.role !== "ADMIN") {
    throw new Error("Forbidden");
  }

  return prisma.notification.update({
    where: { id: notificationId },
    data: { read: true },
  });
}
