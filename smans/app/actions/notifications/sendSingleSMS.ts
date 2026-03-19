// app/actions/notifications/sendSingleSMS.ts
"use server";

import { authOptions } from "@/lib/auth/auth";
import { logger } from "@/lib/logger";
import { prisma } from "@/lib/prisma";
import { smsProvider } from "@/lib/services/sms";
import { smsLimiter } from "@/lib/upstash/ratelimit";
import { getServerSession } from "next-auth";

interface SendSingleSMSInput {
  phone: string;
  message: string;
  userId?: string;
  type?: string;
  senderId?: string;
}

interface SendSingleSMSOutput {
  success: boolean;
  messageId?: string;
  error?: string;
}

export async function sendSingleSMS({
  phone,
  message,
  userId,
  type = "GENERAL",
  senderId = "SMANS",
}: SendSingleSMSInput): Promise<SendSingleSMSOutput> {
  const session = await getServerSession(authOptions);

  if (!session?.user || !["ADMIN", "TEACHER"].includes(session.user.role)) {
    throw new Error("Unauthorized: only admins and teachers can send SMS");
  }

  if (!phone?.trim()) {
    throw new Error("Phone number is required");
  }

  if (!message?.trim()) {
    throw new Error("Message is required");
  }

  if (message.length > 160) {
    throw new Error("Message exceeds 160 characters for a single SMS");
  }

  // Rate limit per sender
  const { success: withinLimit, reset } = await smsLimiter.limit(session.user.id);

  if (!withinLimit) {
    const waitSeconds = Math.ceil((reset - Date.now()) / 1000);
    throw new Error(`SMS rate limit reached. Please wait ${waitSeconds} seconds.`);
  }

  try {
    const result = await smsProvider.sendSMS(phone.trim(), message.trim());

    if (!result.success) {
      logger.error("Single SMS delivery failed", { phone, senderId });
      return { success: false, error: "SMS provider failed to deliver the message" };
    }

    // Create in-app notification record if userId is provided
    if (userId) {
      await prisma.notification.create({
        data: {
          userId,
          title: "SMS Notification",
          message,
          read: false,
        },
      });
    }

    logger.info("Single SMS sent successfully", {
      phone,
      type,
      messageId: result.messageId,
      sentBy: session.user.id,
    });

    return { success: true, messageId: result.messageId };
  } catch (error: any) {
    logger.error("Single SMS sending error", {
      phone,
      error: error.message,
    });

    throw new Error("Failed to send SMS. Please try again.");
  }
}