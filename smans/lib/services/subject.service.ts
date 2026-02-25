// lib/services/subject.service.ts
import { prisma } from "@/lib/prisma";

export class SubjectService {
  static async create(data: { name: string; code: string; description?: string | null }) {
    const { name, code, description } = data;

    // Prevent duplicate code
    const existing = await prisma.subject.findUnique({ where: { code } });
    if (existing) {
      throw new Error(`Subject code "${code}" already exists`);
    }

    return prisma.subject.create({
      data: {
        name: name.trim(),
        code: code.trim().toUpperCase(),
        description: description?.trim() ?? null,
      },
    });
  }

  static async findById(id: string) {
    return prisma.subject.findUnique({
      where: { id },
      include: {
        classes: { select: { name: true, level: true } },
      },
    });
  }

  static async findAll() {
    return prisma.subject.findMany({
      orderBy: { name: "asc" },
      include: {
        classes: { select: { name: true, level: true } },
      },
    });
  }

  static async update(id: string, data: { name?: string; code?: string; description?: string | null }) {
    return prisma.subject.update({
      where: { id },
      data: {
        name: data.name ? data.name.trim() : undefined,
        code: data.code ? data.code.trim().toUpperCase() : undefined,
        description: data.description !== undefined ? (data.description?.trim() ?? null) : undefined,
      },
    });
  }

  static async delete(id: string) {
    // Optional: check if subject is used in timetable/grades before delete
    const usageCount = await prisma.timetable.count({ where: { subjectId: id } });
    if (usageCount > 0) {
      throw new Error("Cannot delete subject that is used in timetable");
    }

    return prisma.subject.delete({ where: { id } });
  }
}