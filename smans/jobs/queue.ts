// jobs/queue.ts
// Central BullMQ queue setup (Redis-based)

import { logger } from "@/lib/logger";
import { Queue, Worker } from "bullmq";

// Redis connection config (from .env)
const connection = {
  host: process.env.REDIS_HOST || "localhost",
  port: Number(process.env.REDIS_PORT) || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
};

// Global queues (you can create more per domain)
export const notificationQueue = new Queue("notifications", { connection });
export const reportQueue = new Queue("reports", { connection });
export const cleanupQueue = new Queue("cleanup", { connection });

// Worker setup (runs in background or separate process)
export function startWorkers() {
  // Notification worker
  new Worker("notifications", async (job) => {
    logger.info(`Processing notification job: ${job.id}`);
    // Call email/sms service here (see notification.job.ts)
    await require("./notification.job").sendNotification(job.data);
  }, { connection });

  // Report worker
  new Worker("reports", async (job) => {
    logger.info(`Generating report: ${job.id}`);
    await require("./report.job").generateReport(job.data);
  }, { connection });

  // Cleanup worker (e.g. old logs, temp files)
  new Worker("cleanup", async (job) => {
    logger.info(`Running cleanup: ${job.id}`);
    await require("./cleanup.job").cleanup(job.data);
  }, { connection });

  logger.info("BullMQ workers started");
}

// Optional: Graceful shutdown
process.on("SIGTERM", async () => {
  logger.info("Shutting down BullMQ workers...");
  await Promise.all([
    notificationQueue.close(),
    reportQueue.close(),
    cleanupQueue.close(),
  ]);
  process.exit(0);
});