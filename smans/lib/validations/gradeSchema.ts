// lib/validations/gradeSchema.ts
import * as z from "zod";

export const gradeEntrySchema = z.object({
  studentId: z.string(),
  examName: z.string().min(1, "Exam name required"),
  subject: z.string().min(1),
  marks: z.number().min(0).max(100),
  maxMarks: z.number().min(1).default(100),
});

export const gradesBatchSchema = z.object({
  studentId: z.string(),
  examName: z.string(),
  grades: z.array(
    z.object({
      subject: z.string(),
      marks: z.number().min(0),
      maxMarks: z.number().optional(),
    })
  ),
});