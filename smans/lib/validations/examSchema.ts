// validations/examSchema.ts
import { z } from 'zod';

export const createExamSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').trim(),
  subjectId: z.string().min(1, 'Subject is required'),
  classId: z.string().min(1, 'Class is required'),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid date format',
  }),
  duration: z.number().min(15, 'Duration must be at least 15 minutes'),
  maxScore: z.number().min(1, 'Max score must be greater than 0'),
});

export const updateExamSchema = createExamSchema.partial();

export type CreateExamInput = z.infer<typeof createExamSchema>;
export type UpdateExamInput = z.infer<typeof updateExamSchema>;