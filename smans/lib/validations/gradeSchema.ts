// lib/validations/gradeSchema.ts
import * as z from "zod";

export const gradeEntrySchema = z.object({
  studentId: z.string().min(1, "Student is required"),
  examId: z.string().min(1, "Exam is required"), // Changed from examName to examId
  subjectId: z.string().min(1, "Subject is required"), // Changed from subject to subjectId
  marks: z.number().min(0, "Marks cannot be negative").max(100, "Marks cannot exceed 100"),
  maxMarks: z.number().min(1, "Max marks must be at least 1").default(100),
  assessmentType: z.enum(["FORMATIVE", "SUMMATIVE", "CBC_CHECK"]).optional(),
  competencyLevel: z.string().optional(),
  remarks: z.string().optional(),
});

export const gradesBatchSchema = z.object({
  examId: z.string().min(1, "Exam is required"),
  grades: z.array(
    z.object({
      studentId: z.string().min(1, "Student is required"),
      subjectId: z.string().min(1, "Subject is required"),
      marks: z.number().min(0, "Marks cannot be negative").max(100, "Marks cannot exceed 100"),
      maxMarks: z.number().min(1).default(100),
      assessmentType: z.enum(["FORMATIVE", "SUMMATIVE", "CBC_CHECK"]).optional(),
      competencyLevel: z.string().optional(),
      remarks: z.string().optional(),
    })
  ).min(1, "At least one grade is required"),
});

// Schema for publishing grades
export const publishGradesSchema = z.object({
  examId: z.string().min(1, "Exam is required"),
  notifyStudents: z.boolean().default(true),
  notifyParents: z.boolean().default(true),
});

// Schema for grade report generation
export const gradeReportSchema = z.object({
  examId: z.string().optional(),
  classId: z.string().optional(),
  studentId: z.string().optional(),
  subjectId: z.string().optional(),
  fromDate: z.string().datetime().optional(),
  toDate: z.string().datetime().optional(),
});

export type GradeEntryFormData = z.infer<typeof gradeEntrySchema>;
export type GradesBatchFormData = z.infer<typeof gradesBatchSchema>;