// lib/validations/attendanceSchema.ts
import * as z from "zod";

export const attendanceRecordSchema = z.object({
  studentId: z.string().min(1, "Student is required"),
  classId: z.string().min(1, "Class is required"),
  status: z.enum(["PRESENT", "ABSENT", "LATE"]), // Changed from present boolean to status enum
});

export const markAttendanceSchema = z.object({
  date: z.coerce.date(), // Changed from string().date() to coerce.date()
  classId: z.string().min(1, "Class is required"),
  records: z.array(attendanceRecordSchema).min(1, "At least one attendance record is required"),
});

// Schema for bulk attendance marking (entire class)
export const classAttendanceSchema = z.object({
  date: z.coerce.date(),
  classId: z.string().min(1, "Class is required"),
  presentStudents: z.array(z.string()), // Array of student IDs marked present
  absentStudents: z.array(z.string()), // Array of student IDs marked absent
  lateStudents: z.array(z.string()).optional(), // Array of student IDs marked late
});

// Schema for attendance report generation
export const attendanceReportSchema = z.object({
  classId: z.string().optional(),
  studentId: z.string().optional(),
  fromDate: z.coerce.date(),
  toDate: z.coerce.date(),
  status: z.enum(["PRESENT", "ABSENT", "LATE"]).optional(),
});

// Schema for attendance statistics
export const attendanceStatsSchema = z.object({
  classId: z.string().optional(),
  fromDate: z.coerce.date(),
  toDate: z.coerce.date(),
});

export type AttendanceRecordFormData = z.infer<typeof attendanceRecordSchema>;
export type MarkAttendanceFormData = z.infer<typeof markAttendanceSchema>;
export type ClassAttendanceFormData = z.infer<typeof classAttendanceSchema>;