"use server";

import { prisma } from "@/lib/prisma";

export async function logAction(
  action: string,
  entity: string,
  entityId?: string,
  metadata?: any,
  userId?: string
) {
  return prisma.auditLog.create({
    data: {
      action,
      entity,
      entityId,
      metadata,
      userId,
    },
  });
}
