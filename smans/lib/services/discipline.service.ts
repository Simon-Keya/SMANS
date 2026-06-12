// lib/services/discipline.service.ts
import { prisma } from "@/lib/prisma";

export class DisciplineService {
  static async record(data: {
    studentId: string;
    issue: string;
    description?: string | null;
    reportedBy: string;
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
        student: { 
          select: { 
            name: true, 
            admissionNumber: true,
            class: { select: { name: true } }
          } 
        },
      },
    });
  }

  static async getForStudent(studentId: string) {
    return prisma.disciplineRecord.findMany({
      where: { studentId },
      orderBy: { date: "desc" },
      include: {
        student: { 
          select: { 
            name: true, 
            admissionNumber: true,
            class: { select: { name: true } }
          } 
        },
      },
    });
  }

  static async getAll(filters?: { fromDate?: Date; toDate?: Date; studentId?: string }) {
    return prisma.disciplineRecord.findMany({
      where: {
        studentId: filters?.studentId,
        date: {
          gte: filters?.fromDate,
          lte: filters?.toDate,
        },
      },
      include: {
        student: { 
          select: { 
            name: true, 
            admissionNumber: true,
            class: { select: { name: true } }
          } 
        },
      },
      orderBy: { date: "desc" },
    });
  }

  static async update(id: string, data: { issue?: string; description?: string | null }) {
    return prisma.disciplineRecord.update({
      where: { id },
      data: {
        issue: data.issue?.trim(),
        description: data.description?.trim() ?? null,
      },
      include: {
        student: { 
          select: { 
            name: true, 
            admissionNumber: true 
          } 
        },
      },
    });
  }

  static async delete(id: string) {
    return prisma.disciplineRecord.delete({ where: { id } });
  }

  static async getStats(studentId: string) {
    const records = await prisma.disciplineRecord.findMany({
      where: { studentId },
    });

    return {
      total: records.length,
      byIssue: records.reduce((acc, record) => {
        acc[record.issue] = (acc[record.issue] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      recent: records.slice(0, 5),
    };
  }
}