// app/actions/audit/logAction.ts
"use server";

import { prisma } from "@/lib/prisma";

export async function logAction(
  action: string,
  entity: string,
  entityId?: string,
  metadata?: any,
  userId?: string
) {
  try {
    const log = await prisma.auditLog.create({
      data: {
        action,
        entity,
        entityId,
        metadata: metadata ? JSON.stringify(metadata) : null, // Prisma Json needs string or object
        userId,
      },
    });

    return { success: true, data: log };
  } catch (error) {
    console.error("[AUDIT_LOG_ERROR]", error);
    return { success: false, error: "Failed to log action" };
  }
}