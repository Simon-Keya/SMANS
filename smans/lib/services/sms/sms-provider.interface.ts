export interface SMSProvider {
    sendSMS(to: string, message: string): Promise<{ success: boolean; messageId?: string }>;
    sendBulkSMS(recipients: string[], message: string): Promise<{ successCount: number; failed: string[] }>;
  }