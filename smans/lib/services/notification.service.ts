// lib/services/notification.service.ts
import { prisma } from "@/lib/prisma";

export class NotificationService {
  static async create(data: {
    title: string;
    message: string;
    userId: string;
    type?: "INFO" | "WARNING" | "SUCCESS" | "ERROR";
  }) {
    return prisma.notification.create({
      data: {
        title: data.title.trim(),
        message: data.message.trim(),
        userId: data.userId,
        type: data.type ?? "INFO",
      },
    });
  }

  static async createMany(notifications: Array<{
    title: string;
    message: string;
    userId: string;
    type?: "INFO" | "WARNING" | "SUCCESS" | "ERROR";
  }>) {
    return prisma.notification.createMany({
      data: notifications.map(n => ({
        title: n.title.trim(),
        message: n.message.trim(),
        userId: n.userId,
        type: n.type ?? "INFO",
      })),
    });
  }

  static async getUnread(userId: string) {
    return prisma.notification.findMany({
      where: {
        userId,
        read: false,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  static async markAsRead(notificationId: string, userId: string) {
    return prisma.notification.updateMany({
      where: {
        id: notificationId,
        userId, // security: only owner can mark as read
        read: false,
      },
      data: { read: true },
    });
  }

  static async markAllAsRead(userId: string) {
    return prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });
  }

  static async delete(id: string, userId: string) {
    return prisma.notification.deleteMany({
      where: { id, userId },
    });
  }
}