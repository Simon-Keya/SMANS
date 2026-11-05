"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { createHash } from "crypto";

/**
 * Append an audit log entry. userId is taken from session when available
 * so callers cannot spoof identity. Optional content hash for basic integrity.
 */
export async function logAction(
  action: string,
  entity: string,
  entityId?: string,
  metadata?: Record<string, unknown>,
  _userId?: string // ignored — session is authoritative
) {
  try {
    const user = await getCurrentUser();
    const userId = user?.id ?? null;

    if (!action?.trim() || !entity?.trim()) {
      return { success: false, error: "action and entity are required" };
    }

    // Basic integrity: hash of payload at write time (not a chain, but
    // detects casual tampering if stored alongside the row later).
    const payload = JSON.stringify({
      action,
      entity,
      entityId: entityId ?? null,
      userId,
      metadata: metadata ?? null,
      at: new Date().toISOString().slice(0, 16), // minute precision
    });
    const contentHash = createHash("sha256").update(payload).digest("hex");

    const log = await prisma.auditLog.create({
      data: {
        action: action.trim(),
        entity: entity.trim(),
        entityId: entityId ?? null,
        userId,
        metadata: {
          ...(metadata ?? {}),
          _contentHash: contentHash,
        } as object,
      },
    });

    return { success: true, data: log };
  } catch (error) {
    console.error("[AUDIT_LOG_ERROR]", error);
    return { success: false, error: "Failed to log action" };
  }
}
