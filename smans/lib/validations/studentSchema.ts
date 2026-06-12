// lib/validations/studentSchema.ts
import * as z from "zod";

export const studentSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  admissionNumber: z.string().min(1, "Admission number is required"), // Changed from rollNumber
  classId: z.string().min(1, "Class is required"), // Changed from 'class' to 'classId' to match schema
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().optional(),
  parentId: z.string().optional(), // Changed from parentName/parentPhone to parentId
  dateOfBirth: z.string().optional(),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]).optional(),
  address: z.string().optional(),
});

export type StudentFormData = z.infer<typeof studentSchema>;

// Optional: Create a separate schema for student update
export const studentUpdateSchema = studentSchema.partial();

// Optional: Schema for student search/filter
export const studentFilterSchema = z.object({
  classId: z.string().optional(),
  search: z.string().optional(),
  status: z.enum(["ACTIVE", "GRADUATED", "TRANSFERRED"]).optional(),
});