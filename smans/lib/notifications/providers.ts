import { sendEmail } from "./emailProvider";
import { sendSMS } from "./smsProvider";

type NotificationPayload = {
  toEmail?: string;
  toPhone?: string;
  subject?: string;
  message: string;
};

export async function notify(payload: NotificationPayload) {
  const tasks: Promise<any>[] = [];

  if (payload.toEmail) {
    tasks.push(
      sendEmail(payload.toEmail, payload.subject ?? "", payload.message)
    );
  }

  if (payload.toPhone) {
    tasks.push(sendSMS(payload.toPhone, payload.message));
  }

  await Promise.all(tasks);
}
