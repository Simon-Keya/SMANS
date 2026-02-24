import { prisma } from "@/lib/db/prisma";

export class NotificationService {
  static async send(userId: string, title: string, message: string) {
    return prisma.notification.create({
      data: {
        title,
        message,
        userId,
      },
    });
  }

  static async markAsRead(notificationId: string) {
    return prisma.notification.update({
      where: { id: notificationId },
      data: { read: true },
    });
  }
}