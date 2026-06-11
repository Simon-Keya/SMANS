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
        student: { 
          select: { 
            name: true, 
            admissionNumber: true  // Changed from rollNumber to admissionNumber
          } 
        },
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
    const absent = records.filter(r => r.status === "ABSENT").length;
    const late = records.filter(r => r.status === "LATE").length;

    return {
      studentId,
      month,
      year,
      totalDays: total,
      presentDays: present,
      absentDays: absent,
      lateDays: late,
      attendanceRate: total > 0 ? Math.round((present / total) * 100) : 0,
    };
  }

  /**
   * Get student attendance for a date range
   */
  static async getStudentAttendance(
    studentId: string, 
    startDate: Date, 
    endDate: Date
  ) {
    const records = await prisma.attendance.findMany({
      where: {
        studentId,
        date: { gte: startDate, lte: endDate },
      },
      orderBy: { date: "asc" },
    });

    return records;
  }

  /**
   * Get class attendance for a date range
   */
  static async getClassAttendance(
    classId: string,
    startDate: Date,
    endDate: Date
  ) {
    const records = await prisma.attendance.findMany({
      where: {
        classId,
        date: { gte: startDate, lte: endDate },
      },
      include: {
        student: {
          select: {
            name: true,
            admissionNumber: true,
          },
        },
      },
      orderBy: [{ date: "asc" }, { student: { name: "asc" } }],
    });

    return records;
  }

  /**
   * Get attendance statistics for a class over a date range
   */
  static async getClassAttendanceStats(
    classId: string,
    startDate: Date,
    endDate: Date
  ) {
    const records = await prisma.attendance.findMany({
      where: {
        classId,
        date: { gte: startDate, lte: endDate },
      },
    });

    const totalRecords = records.length;
    const present = records.filter(r => r.status === "PRESENT").length;
    const absent = records.filter(r => r.status === "ABSENT").length;
    const late = records.filter(r => r.status === "LATE").length;

    // Get unique students
    const uniqueStudents = new Set(records.map(r => r.studentId));
    const totalStudents = uniqueStudents.size;

    return {
      classId,
      startDate,
      endDate,
      totalRecords,
      totalStudents,
      present,
      absent,
      late,
      overallAttendanceRate: totalRecords > 0 ? Math.round((present / totalRecords) * 100) : 0,
    };
  }
}