// lib/services/notification.service.ts
import { logger } from "@/lib/logger";
import { prisma } from "@/lib/prisma";

export class NotificationService {
  /**
   * Create a single notification (used by jobs and actions)
   */
  static async create(data: {
    title: string;
    message: string;
    userId: string;
    type?: "INFO" | "WARNING" | "SUCCESS" | "ERROR";
  }) {
    try {
      const notification = await prisma.notification.create({
        data: {
          title: data.title.trim(),
          message: data.message.trim(),
          userId: data.userId,
          type: data.type ?? "INFO",
        },
      });

      logger.info(`Notification created for user ${data.userId}`, { id: notification.id });
      return notification;
    } catch (error) {
      logger.error("Failed to create notification", error);
      throw error;
    }
  }

  /**
   * Convenience method called by jobs (matches job usage)
   */
  static async send(userId: string, title: string, message: string, type: "INFO" | "WARNING" | "SUCCESS" | "ERROR" = "INFO") {
    return this.create({ title, message, userId, type });
  }

  /**
   * Create multiple notifications (bulk)
   */
  static async createMany(notifications: Array<{
    title: string;
    message: string;
    userId: string;
    type?: "INFO" | "WARNING" | "SUCCESS" | "ERROR";
  }>) {
    try {
      const result = await prisma.notification.createMany({
        data: notifications.map(n => ({
          title: n.title.trim(),
          message: n.message.trim(),
          userId: n.userId,
          type: n.type ?? "INFO",
        })),
      });

      logger.info(`Created ${result.count} bulk notifications`);
      return result;
    } catch (error) {
      logger.error("Bulk notification creation failed", error);
      throw error;
    }
  }

  /**
   * Get unread notifications for a user (paginated)
   */
  static async getUnread(userId: string, take = 20, skip = 0) {
    return prisma.notification.findMany({
      where: {
        userId,
        read: false,
      },
      orderBy: { createdAt: "desc" },
      take,
      skip,
    });
  }

  /**
   * Mark a single notification as read
   */
  static async markAsRead(notificationId: string, userId: string) {
    const updated = await prisma.notification.updateMany({
      where: {
        id: notificationId,
        userId, // security: only owner can mark
        read: false,
      },
      data: { read: true },
    });

    if (updated.count === 0) {
      throw new Error("Notification not found or already read");
    }

    return { success: true };
  }

  /**
   * Mark all unread notifications as read for a user
   */
  static async markAllAsRead(userId: string) {
    const updated = await prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });

    logger.info(`Marked ${updated.count} notifications as read for user ${userId}`);
    return { count: updated.count };
  }

  /**
   * Delete a notification (only by owner)
   */
  static async delete(id: string, userId: string) {
    const deleted = await prisma.notification.deleteMany({
      where: { id, userId },
    });

    if (deleted.count === 0) {
      throw new Error("Notification not found");
    }

    return { success: true };
  }
}