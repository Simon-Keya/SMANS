import { prisma } from "@/lib/db/prisma";

export class ReportService {
  static async generateStudentReport(studentId: string) {
    return prisma.transcript.findMany({
      where: { studentId },
      include: {
        student: true,
      },
      orderBy: { year: "desc" },
    });
  }

  static async generateClassReport(classId: string) {
    return prisma.student.findMany({
      where: { classId },
      include: {
        attendance: true,
        grades: {
          include: {
            exam: true,
            subject: true,
          },
        },
      },
    });
  }
}