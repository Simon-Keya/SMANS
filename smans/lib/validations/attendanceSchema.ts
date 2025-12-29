// lib/validations/attendanceSchema.ts
import * as z from "zod";

export const attendanceRecordSchema = z.object({
  studentId: z.string(),
  present: z.boolean(),
});

export const markAttendanceSchema = z.object({
  date: z.string().date(),
  records: z.array(attendanceRecordSchema),
});