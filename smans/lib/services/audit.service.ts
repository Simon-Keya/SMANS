import { prisma } from "@/lib/db/prisma";

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
        metadata: metadata ? JSON.stringify(metadata) : null,
      },
    });
  }
}