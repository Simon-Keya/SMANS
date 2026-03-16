// lib/services/sms/africastalking.provider.ts
import AfricasTalking from 'africastalking';
import { SMSProvider } from './sms-provider.interface';

const credentials = {
  apiKey: process.env.AFRICASTALKING_API_KEY!,
  username: process.env.AFRICASTALKING_USERNAME!,
};

const africastalking = AfricasTalking(credentials);

export class AfricasTalkingProvider implements SMSProvider {
  async sendSMS(to: string, message: string): Promise<{ success: boolean; messageId?: string }> {
    try {
      const result = await africastalking.SMS.send({
        to,
        message,
        from: process.env.SMS_SENDER_ID || 'SMANS',
      });

      return {
        success: true,
        messageId: result.SMSMessageData.MessageParts?.[0]?.MessageId,
      };
    } catch (error) {
      console.error('Africa\'s Talking SMS error:', error);
      return { success: false };
    }
  }

  async sendBulkSMS(recipients: string[], message: string): Promise<{ successCount: number; failed: string[] }> {
    const failed: string[] = [];
    let successCount = 0;

    for (const phone of recipients) {
      const res = await this.sendSMS(phone, message);
      if (res.success) {
        successCount++;
      } else {
        failed.push(phone);
      }
    }

    return { successCount, failed };
  }
}