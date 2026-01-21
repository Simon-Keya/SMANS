// validations/feeSchema.ts
import { z } from 'zod';

export const createFeeItemSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters').trim(),
  amount: z.number().min(1, 'Amount must be greater than 0'),
  frequency: z.enum(['once', 'monthly', 'termly', 'yearly'], {
    required_error: 'Please select a frequency',
  }),
  description: z.string().optional(),
});

export const updateFeeItemSchema = createFeeItemSchema.partial();

export type CreateFeeItemInput = z.infer<typeof createFeeItemSchema>;
export type UpdateFeeItemInput = z.infer<typeof updateFeeItemSchema>;