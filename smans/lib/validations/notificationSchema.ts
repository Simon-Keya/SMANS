// validations/notificationSchema.ts
import { z } from 'zod';

export const createNotificationSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').trim(),
  message: z.string().min(10, 'Message must be at least 10 characters').trim(),
  recipientIds: z.array(z.string()).optional(), // optional bulk send
});

export type CreateNotificationInput = z.infer<typeof createNotificationSchema>;