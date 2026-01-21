// validations/subjectSchema.ts
import { z } from 'zod';

export const createSubjectSchema = z.object({
  name: z.string().min(2, 'Subject name must be at least 2 characters').trim(),
  code: z.string().min(2, 'Subject code must be at least 2 characters').trim().toUpperCase(),
  description: z.string().optional(),
});

export const updateSubjectSchema = createSubjectSchema.partial();

export type CreateSubjectInput = z.infer<typeof createSubjectSchema>;
export type UpdateSubjectInput = z.infer<typeof updateSubjectSchema>;