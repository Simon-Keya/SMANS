// lib/services/discipline.service.ts
import { prisma } from "@/lib/prisma";

export class DisciplineService {
  static async record(data: {
    studentId: string;
    issue: string;
    description?: string | null;
    reportedBy: string; // teacher/user ID
    date?: Date;
  }) {
    return prisma.disciplineRecord.create({
      data: {
        studentId: data.studentId,
        issue: data.issue.trim(),
        description: data.description?.trim() ?? null,
        reportedBy: data.reportedBy,
        date: data.date ?? new Date(),
      },
      include: {
        student: { select: { name: true, rollNumber: true } },
      },
    });
  }

  static async getForStudent(studentId: string) {
    return prisma.disciplineRecord.findMany({
      where: { studentId },
      orderBy: { date: "desc" },
      include: {
        student: true,
      },
    });
  }
}