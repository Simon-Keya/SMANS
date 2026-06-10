// app/actions/notifications/scheduleSMS.ts
"use server";

import { authOptions } from "@/lib/auth/auth";
import { logger } from "@/lib/logger";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { z } from "zod";

// ── Validation schema ─────────────────────────────────────────────────────────

const scheduleSMSSchema = z.object({
  recipients: z
    .array(
      z.object({
        phone: z.string().min(10, "Invalid phone number"),
        userId: z.string().optional(),
        name: z.string().optional(),
      })
    )
    .min(1, "At least one recipient is required"),
  message: z
    .string()
    .min(1, "Message is required")
    .max(160, "Message exceeds 160 characters"),
  scheduledAt: z
    .string()
    .datetime("Invalid date format — use ISO 8601")
    .refine(
      (val) => new Date(val) > new Date(),
      "Scheduled time must be in the future"
    ),
  type: z.string().default("GENERAL"),
  senderId: z.string().default("SMANS"),
  label: z.string().optional(),
});

type ScheduleSMSInput = z.infer<typeof scheduleSMSSchema>;

// ── Output type ───────────────────────────────────────────────────────────────

interface ScheduleSMSOutput {
  success: boolean;
  jobId: string;
  scheduledAt: string;
  recipientCount: number;
}

// ── Action ────────────────────────────────────────────────────────────────────

export async function scheduleSMS(
  input: ScheduleSMSInput
): Promise<ScheduleSMSOutput> {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized: only admins can schedule SMS messages");
  }

  // Validate input
  const validated = scheduleSMSSchema.parse(input);

  const scheduledAt = new Date(validated.scheduledAt);

  // Enforce a reasonable scheduling window (max 30 days ahead)
  const maxScheduleAhead = new Date();
  maxScheduleAhead.setDate(maxScheduleAhead.getDate() + 30);

  if (scheduledAt > maxScheduleAhead) {
    throw new Error("Cannot schedule SMS more than 30 days in advance");
  }

  // Store scheduled job in AuditLog as a workaround
  const jobId = `sms_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  await prisma.auditLog.create({
    data: {
      userId: session.user.id,
      action: "SCHEDULE_SMS",
      entity: "ScheduledSMS",
      entityId: jobId,
      metadata: {
        recipients: validated.recipients,
        message: validated.message,
        scheduledAt: scheduledAt.toISOString(),
        type: validated.type,
        senderId: validated.senderId,
        label: validated.label ?? null,
        status: "PENDING",
        createdBy: session.user.id,
      },
    },
  });

  logger.info("SMS scheduled successfully", {
    jobId,
    scheduledAt: scheduledAt.toISOString(),
    recipientCount: validated.recipients.length,
    scheduledBy: session.user.id,
  });

  return {
    success: true,
    jobId,
    scheduledAt: scheduledAt.toISOString(),
    recipientCount: validated.recipients.length,
  };
}

// ── Cancel a scheduled SMS ────────────────────────────────────────────────────

export async function cancelScheduledSMS(jobId: string): Promise<{ success: boolean }> {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  if (!jobId?.trim()) {
    throw new Error("Job ID is required");
  }

  // Find the scheduled job in audit log
  const job = await prisma.auditLog.findFirst({
    where: {
      entity: "ScheduledSMS",
      entityId: jobId,
      action: "SCHEDULE_SMS",
    },
  });

  if (!job) {
    throw new Error("Scheduled SMS job not found");
  }

  const metadata = job.metadata as any;
  
  if (metadata.status !== "PENDING") {
    throw new Error(
      `Cannot cancel a job with status "${metadata.status}". Only PENDING jobs can be cancelled.`
    );
  }

  const scheduledAt = new Date(metadata.scheduledAt);
  if (scheduledAt <= new Date()) {
    throw new Error("Cannot cancel a job that is already due or past its scheduled time");
  }

  // Update status in metadata
  await prisma.auditLog.update({
    where: { id: job.id },
    data: {
      metadata: {
        ...metadata,
        status: "CANCELLED",
        cancelledAt: new Date().toISOString(),
        cancelledBy: session.user.id,
      },
    },
  });

  logger.info("Scheduled SMS cancelled", {
    jobId,
    cancelledBy: session.user.id,
  });

  return { success: true };
}

// ── List scheduled SMS jobs ───────────────────────────────────────────────────

export async function getScheduledSMSJobs(options?: {
  status?: "PENDING" | "SENT" | "FAILED" | "CANCELLED";
  limit?: number;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  const jobs = await prisma.auditLog.findMany({
    where: {
      entity: "ScheduledSMS",
      action: "SCHEDULE_SMS",
    },
    orderBy: { createdAt: "desc" },
    take: options?.limit ?? 50,
  });

  // Filter by status if provided
  let filteredJobs = jobs;
  if (options?.status) {
    filteredJobs = jobs.filter(job => {
      const metadata = job.metadata as any;
      return metadata.status === options.status;
    });
  }

  return filteredJobs.map(job => ({
    id: job.entityId,
    label: (job.metadata as any)?.label ?? null,
    message: (job.metadata as any)?.message,
    scheduledAt: (job.metadata as any)?.scheduledAt,
    status: (job.metadata as any)?.status,
    type: (job.metadata as any)?.type,
    senderId: (job.metadata as any)?.senderId,
    createdAt: job.createdAt,
    createdBy: (job.metadata as any)?.createdBy,
  }));
}