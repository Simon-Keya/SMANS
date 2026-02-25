// jobs/notification.job.ts
import { logger } from "@/lib/logger"
import { EmailService } from "@/lib/services/email.service"
import { NotificationService } from "@/lib/services/notification.service"
import { SmsService } from "@/lib/services/sms.service"

interface NotificationJobData {
  userId: string
  title: string
  message: string
  sendEmail?: boolean
  sendSms?: boolean
  email?: string
  phone?: string
  type?: "INFO" | "WARNING" | "SUCCESS" | "ERROR"
}

export async function sendNotification(data: NotificationJobData) {
  try {
    // 1. Save in-app notification
    await NotificationService.send(
      data.userId,
      data.title,
      data.message,
      data.type ?? "INFO"
    )

    // 2. Email (if requested and address provided)
    if (data.sendEmail && data.email) {
      await EmailService.sendNotification(
        data.email,
        data.title,
        data.message
      )
    }

    // 3. SMS (if requested and phone provided)
    if (data.sendSms && data.phone) {
      const smsText = `${data.title}\n\n${data.message}\n\nSMANS`
      await SmsService.send(data.phone, smsText)
    }

    logger.info(`Notification job completed successfully`, {
      userId: data.userId,
      title: data.title,
      channels: [
        "in-app",
        data.sendEmail && data.email ? "email" : null,
        data.sendSms && data.phone ? "sms" : null,
      ].filter(Boolean),
    })
  } catch (error) {
    logger.error("Notification job failed", {
      error,
      userId: data.userId,
      title: data.title,
    })
    throw error // let BullMQ handle retries if configured
  }
}