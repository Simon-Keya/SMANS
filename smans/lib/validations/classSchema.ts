// validations/classSchema.ts
import { z } from 'zod';

export const createClassSchema = z.object({
  name: z.string().min(3, 'Class name must be at least 3 characters').trim(),
  level: z.string().min(1, 'Level/Grade is required').trim(),
  teacherId: z.string().optional(),
});

export const updateClassSchema = createClassSchema.partial();

export type CreateClassInput = z.infer<typeof createClassSchema>;
export type UpdateClassInput = z.infer<typeof updateClassSchema>;