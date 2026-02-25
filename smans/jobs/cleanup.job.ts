// jobs/cleanup.job.ts
import { logger } from "@/lib/logger";
import { prisma } from "@/lib/prisma";

interface CleanupJobData {
  daysOld: number; // e.g. 30
  entity?: "audit_logs" | "notifications" | "temp_files";
}

export async function cleanup(data: CleanupJobData = { daysOld: 30 }) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - data.daysOld);

  try {
    if (!data.entity || data.entity === "audit_logs") {
      const deletedLogs = await prisma.auditLog.deleteMany({
        where: {
          createdAt: { lt: cutoff },
        },
      });
      logger.info(`Cleaned ${deletedLogs.count} old audit logs`);
    }

    if (!data.entity || data.entity === "notifications") {
      const deletedNotifs = await prisma.notification.deleteMany({
        where: {
          createdAt: { lt: cutoff },
          read: true,
        },
      });
      logger.info(`Cleaned ${deletedNotifs.count} old read notifications`);
    }

    // Add more cleanup rules (temp files, old uploads, etc.)
    logger.info(`Cleanup completed for items older than ${data.daysOld} days`);
  } catch (error) {
    logger.error("Cleanup job failed", error);
    throw error;
  }
}