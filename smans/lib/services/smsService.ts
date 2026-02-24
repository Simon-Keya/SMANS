// Placeholder - integrate with real SMS provider (Twilio, Africa's Talking, etc.)
export class SmsService {
    static async send(phone: string, message: string) {
      console.log(`[SMS] Sending to ${phone}: ${message}`);
      // Real implementation here (Twilio, etc.)
      // await twilio.messages.create({ to: phone, from: process.env.TWILIO_PHONE, body: message });
    }
  }