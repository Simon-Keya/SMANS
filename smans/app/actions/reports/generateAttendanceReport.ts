// app/actions/reports/generateAttendanceReport.ts
"use server";

import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const generateAttendanceReportSchema = z.object({
  classId: z.string().min(1, "Class ID is required"),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
});

export async function generateAttendanceReport(input: unknown) {
  const user = await getCurrentUser();

  if (!user || !["ADMIN", "TEACHER"].includes(user.role)) {
    throw new Error("Unauthorized: Only admins and teachers can generate attendance reports");
  }

  const validated = generateAttendanceReportSchema.safeParse(input);
  if (!validated.success) {
    throw new Error(validated.error.issues[0]?.message || "Invalid input");
  }

  const { classId, startDate, endDate } = validated.data;

  try {
    const attendance = await prisma.attendance.findMany({
      where: {
        student: { classId },
        date: {
          gte: startDate || undefined,
          lte: endDate || undefined,
        },
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            rollNumber: true,
          },
        },
      },
      orderBy: [
        { student: { name: "asc" } },
        { date: "desc" },
      ],
    });

    // Explicit typing to fix implicit any
    const summary = attendance.reduce((acc: Record<string, any>, record: any) => {
      const studentId = record.student.id;

      if (!acc[studentId]) {
        acc[studentId] = {
          studentId,
          studentName: record.student.name,
          rollNumber: record.student.rollNumber,
          totalDays: 0,
          presentDays: 0,
          absentDays: 0,
          attendancePercentage: 0,
        };
      }

      acc[studentId].totalDays += 1;
      if (record.status === "PRESENT") acc[studentId].presentDays += 1;
      else acc[studentId].absentDays += 1;

      acc[studentId].attendancePercentage = Math.round(
        (acc[studentId].presentDays / acc[studentId].totalDays) * 100
      );

      return acc;
    }, {});

    return {
      success: true,
      attendanceRecords: attendance,
      summary: Object.values(summary),
      totalStudents: Object.keys(summary).length,
    };
  } catch (error) {
    console.error("Generate attendance report error:", error);
    throw new Error("Failed to generate attendance report. Please try again.");
  }
}