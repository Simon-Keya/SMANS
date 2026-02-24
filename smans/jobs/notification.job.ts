// jobs/notification.job.ts
import { logger } from "@/lib/logger";
import { EmailService } from "@/lib/services/email.service";
import { NotificationService } from "@/lib/services/notification.service";
import { SmsService } from "@/lib/services/sms.service";

interface NotificationJobData {
  userId: string;
  title: string;
  message: string;
  sendEmail?: boolean;
  sendSms?: boolean;
  email?: string;
  phone?: string;
}

export async function sendNotification(data: NotificationJobData) {
  try {
    // Save in-app notification
    await NotificationService.send(data.userId, data.title, data.message);

    // Send email if requested
    if (data.sendEmail && data.email) {
      await EmailService.sendNotification(data.email, data.title, data.message);
    }

    // Send SMS if requested
    if (data.sendSms && data.phone) {
      await SmsService.send(data.phone, `${data.title}: ${data.message}`);
    }

    logger.info(`Notification sent to user ${data.userId}`);
  } catch (error) {
    logger.error("Notification job failed", error);
    throw error; // BullMQ will retry if configured
  }
}