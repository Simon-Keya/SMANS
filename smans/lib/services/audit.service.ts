// lib/services/audit.service.ts
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { createHash } from "crypto";

function hashPayload(parts: Record<string, unknown>): string {
  return createHash("sha256")
    .update(JSON.stringify(parts))
    .digest("hex");
}

export class AuditService {
  /**
   * Append-only audit entry with hash chain linkage.
   * prevHash = contentHash of the previous row (by createdAt desc).
   */
  static async log(
    userId: string | null,
    action: string,
    entity: string,
    entityId?: string,
    metadata?: Record<string, unknown>,
    extras?: { ipAddress?: string; userAgent?: string }
  ) {
    const prev = await prisma.auditLog.findFirst({
      orderBy: { createdAt: "desc" },
      select: { contentHash: true },
    });
    const prevHash = prev?.contentHash ?? "GENESIS";

    const contentHash = hashPayload({
      userId,
      action,
      entity,
      entityId: entityId ?? null,
      metadata: metadata ?? null,
      prevHash,
    });

    return prisma.auditLog.create({
      data: {
        userId,
        action,
        entity,
        entityId,
        metadata: (metadata || undefined) as Prisma.InputJsonValue,
        ipAddress: extras?.ipAddress,
        userAgent: extras?.userAgent,
        contentHash,
        prevHash,
      },
    });
  }

  static async logAction(
    userId: string,
    action: string,
    entity: string,
    entityId: string,
    details: Record<string, unknown>
  ) {
    return this.log(userId, action, entity, entityId, details);
  }

  static async getEntityLogs(entity: string, entityId: string) {
    return prisma.auditLog.findMany({
      where: { entity, entityId },
      include: {
        user: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  /** Verify chain integrity for the last N entries (or all if limit null). */
  static async verifyChain(limit = 500): Promise<{
    ok: boolean;
    checked: number;
    brokenAt?: string;
  }> {
    const rows = await prisma.auditLog.findMany({
      orderBy: { createdAt: "asc" },
      take: limit,
      select: {
        id: true,
        userId: true,
        action: true,
        entity: true,
        entityId: true,
        metadata: true,
        contentHash: true,
        prevHash: true,
      },
    });

    let expectedPrev = "GENESIS";
    for (const row of rows) {
      if (!row.contentHash) continue;
      if (row.prevHash && row.prevHash !== expectedPrev && expectedPrev !== "GENESIS") {
        // allow GENESIS only for first with hash
      }
      const recomputed = hashPayload({
        userId: row.userId,
        action: row.action,
        entity: row.entity,
        entityId: row.entityId ?? null,
        metadata: row.metadata ?? null,
        prevHash: row.prevHash ?? "GENESIS",
      });
      if (row.contentHash !== recomputed) {
        return { ok: false, checked: rows.length, brokenAt: row.id };
      }
      if (row.prevHash && row.prevHash !== expectedPrev && expectedPrev !== "GENESIS") {
        // first hashed row may start chain
        if (rows.indexOf(row) > 0) {
          return { ok: false, checked: rows.length, brokenAt: row.id };
        }
      }
      expectedPrev = row.contentHash;
    }
    return { ok: true, checked: rows.length };
  }
}
