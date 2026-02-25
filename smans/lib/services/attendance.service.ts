// lib/services/attendance.service.ts
import { prisma } from "@/lib/prisma";

export class AttendanceService {
  /**
   * Mark attendance for multiple students on a specific date
   */
  static async markBulk(date: Date, records: Array<{
    studentId: string;
    classId: string;
    status: "PRESENT" | "ABSENT" | "LATE";
  }>) {
    return prisma.$transaction(async (tx) => {
      const results = [];

      for (const r of records) {
        const record = await tx.attendance.upsert({
          where: {
            studentId_date: {
              studentId: r.studentId,
              date,
            },
          },
          update: {
            status: r.status,
          },
          create: {
            studentId: r.studentId,
            classId: r.classId,
            date,
            status: r.status,
          },
        });
        results.push(record);
      }

      return results;
    });
  }

  /**
   * Get attendance summary for a class on a specific date
   */
  static async getDailySummary(classId: string, date: Date) {
    const attendance = await prisma.attendance.findMany({
      where: { classId, date },
      include: {
        student: { select: { name: true, rollNumber: true } },
      },
    });

    const total = attendance.length;
    const present = attendance.filter(a => a.status === "PRESENT").length;
    const absent = attendance.filter(a => a.status === "ABSENT").length;
    const late = attendance.filter(a => a.status === "LATE").length;

    return {
      date,
      classId,
      total,
      present,
      absent,
      late,
      attendanceRate: total > 0 ? Math.round((present / total) * 100) : 0,
      records: attendance,
    };
  }

  /**
   * Get monthly attendance summary for a student
   */
  static async getMonthlySummaryForStudent(studentId: string, year: number, month: number) {
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0);

    const records = await prisma.attendance.findMany({
      where: {
        studentId,
        date: { gte: start, lte: end },
      },
    });

    const total = records.length;
    const present = records.filter(r => r.status === "PRESENT").length;

    return {
      studentId,
      month,
      year,
      totalDays: total,
      presentDays: present,
      attendanceRate: total > 0 ? Math.round((present / total) * 100) : 0,
    };
  }
}