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

  // Persist the scheduled job to the database
  // This record is picked up by the background job runner (e.g. invoiceReminder.job.ts)
  const scheduledJob = await prisma.scheduledSMS.create({
    data: {
      recipients: validated.recipients as any,
      message: validated.message,
      scheduledAt,
      type: validated.type,
      senderId: validated.senderId,
      label: validated.label ?? null,
      status: "PENDING",
      createdBy: session.user.id,
    },
  });

  logger.info("SMS scheduled successfully", {
    jobId: scheduledJob.id,
    scheduledAt: scheduledAt.toISOString(),
    recipientCount: validated.recipients.length,
    scheduledBy: session.user.id,
  });

  return {
    success: true,
    jobId: scheduledJob.id,
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

  const job = await prisma.scheduledSMS.findUnique({
    where: { id: jobId },
  });

  if (!job) {
    throw new Error("Scheduled SMS job not found");
  }

  if (job.status !== "PENDING") {
    throw new Error(
      `Cannot cancel a job with status "${job.status}". Only PENDING jobs can be cancelled.`
    );
  }

  if (new Date(job.scheduledAt) <= new Date()) {
    throw new Error("Cannot cancel a job that is already due or past its scheduled time");
  }

  await prisma.scheduledSMS.update({
    where: { id: jobId },
    data: { status: "CANCELLED" },
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

  const jobs = await prisma.scheduledSMS.findMany({
    where: {
      ...(options?.status ? { status: options.status } : {}),
    },
    orderBy: { scheduledAt: "asc" },
    take: options?.limit ?? 50,
    select: {
      id: true,
      label: true,
      message: true,
      scheduledAt: true,
      status: true,
      type: true,
      senderId: true,
      createdAt: true,
      createdBy: true,
    },
  });

  return jobs;
}