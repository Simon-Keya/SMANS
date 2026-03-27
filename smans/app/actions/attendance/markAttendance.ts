// app/actions/attendance/markAttendance.ts
"use server";

import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const attendanceRecordSchema = z.object({
  studentId: z.string().min(1, "Student ID is required"),
  classId: z.string().min(1, "Class ID is required"),
  present: z.boolean(),
  remarks: z.string().max(200).optional(),   // Optional teacher note (useful in CBC)
});

const markAttendanceSchema = z.object({
  date: z.coerce.date(),
  records: z.array(attendanceRecordSchema).min(1, "At least one attendance record is required"),
});

export async function markAttendance(input: unknown) {
  const user = await getCurrentUser();

  if (!user || !["ADMIN", "TEACHER"].includes(user.role)) {
    throw new Error("Unauthorized: Only admins and teachers can mark attendance");
  }

  const validated = markAttendanceSchema.safeParse(input);
  if (!validated.success) {
    throw new Error(validated.error.issues[0]?.message || "Invalid input");
  }

  const { date, records } = validated.data;

  try {
    const result = await prisma.$transaction(
      records.map((r) =>
        prisma.attendance.upsert({
          where: {
            studentId_date: {
              studentId: r.studentId,
              date,
            },
          },
          update: {
            status: r.present ? "PRESENT" : "ABSENT",
            remarks: r.remarks?.trim() || null,
            markedById: user.id,
          },
          create: {
            studentId: r.studentId,
            classId: r.classId,
            date,
            status: r.present ? "PRESENT" : "ABSENT",
            remarks: r.remarks?.trim() || null,
            markedById: user.id,
          },
        })
      )
    );

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "MARK_ATTENDANCE",
        entity: "Attendance",
        entityId: date.toISOString(),
        metadata: {
          recordCount: records.length,
          date: date.toISOString(),
          term: "CURRENT", // you can make this dynamic
        },
      },
    });

    return {
      success: true,
      message: `Attendance marked for ${records.length} students on ${date.toLocaleDateString()}`,
      count: records.length,
    };
  } catch (error: any) {
    console.error("Mark attendance error:", error);
    throw new Error("Failed to mark attendance. Please try again.");
  }
}