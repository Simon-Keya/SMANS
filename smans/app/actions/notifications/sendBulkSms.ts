// app/actions/notifications/sendBulkSms.ts
'use server';

import { logger } from '@/lib/logger'; // ← import the logger object
import { prisma } from '@/lib/prisma';
import { smsProvider } from '@/lib/services/sms';

interface SendBulkSMSInput {
  recipients: Array<{ phone: string; userId?: string; name?: string }>;
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
  senderId = 'SMANS',
  type = 'GENERAL',
}: SendBulkSMSInput): Promise<SendBulkSMSOutput> {
  if (!recipients.length) {
    return { success: false, successCount: 0, failed: [], errors: ['No recipients provided'] };
  }

  const failed: string[] = [];
  let successCount = 0;

  for (const recipient of recipients) {
    try {
      const smsResult = await smsProvider.sendSMS(recipient.phone, message);

      if (smsResult.success) {
        successCount++;

        // Create in-app notification record (if userId exists)
        if (recipient.userId) {
          await prisma.notification.create({
            data: {
              userId: recipient.userId,
              title: 'SMS Notification',
              message,
              type,
              channel: 'SMS',
              read: false,
              metadata: { phone: recipient.phone, senderId },
            },
          });
        }
      } else {
        failed.push(recipient.phone);
        logger.error('SMS delivery failed', {
          phone: recipient.phone,
          error: 'SMS provider returned failure',
        });
      }
    } catch (err: any) {
      failed.push(recipient.phone);
      logger.error('SMS sending error', {
        phone: recipient.phone,
        error: err.message,
        stack: err.stack,
      });
    }
  }

  return {
    success: successCount > 0,
    successCount,
    failed,
  };
}