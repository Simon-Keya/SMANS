// app/actions/notifications/sendBulkSms.ts
"use server";

import { authOptions } from "@/lib/auth/auth";
import { logger } from "@/lib/logger";
import { prisma } from "@/lib/prisma";
import { smsProvider } from "@/lib/services/sms";
import { getServerSession } from "next-auth";

interface Recipient {
  phone: string;
  userId?: string;
  name?: string;
}

interface SendBulkSMSInput {
  recipients: Recipient[];
  message: string;
  senderId?: string;
  type?: string;
}

interface SendBulkSMSOutput {
  success: boolean;
  successCount: number;
  failed: string[];
  errors?: string[];
}

export async function sendBulkSMS({
  recipients,
  message,
  senderId = "SMANS",
  type = "GENERAL",
}: SendBulkSMSInput): Promise<SendBulkSMSOutput> {
  const session = await getServerSession(authOptions);

  if (
    !session?.user ||
    !["ADMIN", "TEACHER"].includes(session.user.role)
  ) {
    throw new Error("Unauthorized: Only admins and teachers can send bulk SMS");
  }

  // Input validation
  if (!recipients || recipients.length === 0) {
    return {
      success: false,
      successCount: 0,
      failed: [],
      errors: ["No recipients provided"],
    };
  }

  if (!message?.trim()) {
    return {
      success: false,
      successCount: 0,
      failed: [],
      errors: ["Message is required"],
    };
  }

  if (message.length > 160) {
    return {
      success: false,
      successCount: 0,
      failed: [],
      errors: ["Message exceeds 160 characters for a single SMS"],
    };
  }

  const failed: string[] = [];
  let successCount = 0;

  for (const recipient of recipients) {
    if (!recipient.phone?.trim()) {
      failed.push(recipient.phone ?? "unknown");
      continue;
    }

    try {
      const smsResult = await smsProvider.sendSMS(
        recipient.phone.trim(),
        message.trim()
      );

      if (smsResult.success) {
        successCount++;

        // Create in-app notification if userId provided.
        // Only uses fields that exist in the Notification model:
        // userId, title, message, read — no type/channel/metadata fields.
        if (recipient.userId) {
          await prisma.notification.create({
            data: {
              userId: recipient.userId,
              title: "SMS Notification",
              message: message.trim(),
              read: false,
            },
          });
        }
      } else {
        failed.push(recipient.phone);
        logger.error("SMS delivery failed", {
          phone: recipient.phone,
          senderId,
          type,
          error: "SMS provider returned failure",
        });
      }
    } catch (err: any) {
      failed.push(recipient.phone);
      logger.error("SMS sending error", {
        phone: recipient.phone,
        error: err.message,
        stack: err.stack,
      });
    }
  }

  logger.info("Bulk SMS completed", {
    sentBy: session.user.id,
    total: recipients.length,
    successCount,
    failedCount: failed.length,
    senderId,
    type,
  });

  return {
    success: successCount > 0,
    successCount,
    failed,
  };
}