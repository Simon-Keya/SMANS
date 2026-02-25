// lib/services/assignment.service.ts
import { prisma } from "@/lib/prisma";

export class AssignmentService {
  static async create(data: {
    title: string;
    description?: string | null;
    dueDate: Date;
    classId: string;
    subjectId: string;
    createdBy: string; // teacher ID
  }) {
    return prisma.assignment.create({
      data: {
        title: data.title.trim(),
        description: data.description?.trim() ?? null,
        dueDate: data.dueDate,
        classId: data.classId,
        subjectId: data.subjectId,
        createdBy: data.createdBy,
      },
      include: {
        subject: true,
        class: true,
      },
    });
  }

  static async getForClass(classId: string) {
    return prisma.assignment.findMany({
      where: { classId },
      include: {
        subject: { select: { name: true } },
      },
      orderBy: { dueDate: "asc" },
    });
  }
}