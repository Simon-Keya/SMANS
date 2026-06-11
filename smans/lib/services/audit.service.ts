// lib/services/audit.service.ts
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client"; // Remove 'type' keyword - import the actual namespace

export class AuditService {
  static async log(
    userId: string | null,
    action: string,
    entity: string,
    entityId?: string,
    metadata?: Record<string, any>
  ) {
    return prisma.auditLog.create({
      data: {
        userId,
        action,
        entity,
        entityId,
        metadata: (metadata || undefined) as Prisma.InputJsonValue,
      },
    });
  }

  /**
   * Log a user action with additional metadata
   */
  static async logAction(
    userId: string,
    action: string,
    entity: string,
    entityId: string,
    details: Record<string, any>
  ) {
    return prisma.auditLog.create({
      data: {
        userId,
        action,
        entity,
        entityId,
        metadata: details as Prisma.InputJsonValue,
      },
    });
  }

  /**
   * Get audit logs for a specific entity
   */
  static async getEntityLogs(entity: string, entityId: string) {
    return prisma.auditLog.findMany({
      where: {
        entity,
        entityId,
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  /**
   * Get audit logs for a specific user
   */
  static async getUserLogs(userId: string, limit = 50) {
    return prisma.auditLog.findMany({
      where: { userId },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  }

  /**
   * Get audit logs by action type
   */
  static async getLogsByAction(action: string, limit = 100) {
    return prisma.auditLog.findMany({
      where: { action },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  }

  /**
   * Get recent audit logs
   */
  static async getRecentLogs(limit = 50) {
    return prisma.auditLog.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  }
}