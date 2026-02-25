// lib/validations/feeSchema.ts
import { z } from "zod";

export const feeItemSchema = z.object({
  name: z.string().min(3, "Fee name must be at least 3 characters"),
  amount: z.number().positive("Amount must be greater than 0"),
  frequency: z.enum(["once", "monthly", "termly", "yearly"]),
  description: z.string().max(500).optional().nullable(),
});

export const invoiceSchema = z.object({
  studentId: z.string().cuid(),
  feeItemId: z.string().cuid().optional(),
  amount: z.number().positive(),
  dueDate: z.date(),
});