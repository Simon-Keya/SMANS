// lib/services/class.service.ts
import { prisma } from "@/lib/prisma";

export class ClassService {
  static async create(data: { name: string; level: string; teacherId?: string | null }) {
    const { name, level, teacherId } = data;

    // Prevent duplicate class + level
    const existing = await prisma.class.findFirst({
      where: { name, level },
    });

    if (existing) {
      throw new Error(`Class "${name} - ${level}" already exists`);
    }

    return prisma.class.create({
      data: {
        name: name.trim(),
        level: level.trim(),
        teacherId: teacherId ?? null,
      },
      include: {
        teacher: { select: { name: true, email: true } },
      },
    });
  }

  static async findById(id: string) {
    return prisma.class.findUnique({
      where: { id },
      include: {
        teacher: { select: { name: true, email: true } },
        students: { select: { id: true, name: true, admissionNumber: true } }, // Changed from rollNumber
        subjects: true,
      },
    });
  }

  static async findAll() {
    return prisma.class.findMany({
      include: {
        teacher: { select: { name: true } },
        _count: { select: { students: true } },
      },
      orderBy: { name: "asc" },
    });
  }

  static async update(id: string, data: { name?: string; level?: string; teacherId?: string | null }) {
    return prisma.class.update({
      where: { id },
      data: {
        name: data.name ? data.name.trim() : undefined,
        level: data.level ? data.level.trim() : undefined,
        teacherId: data.teacherId !== undefined ? (data.teacherId ?? null) : undefined,
      },
      include: {
        teacher: { select: { name: true } },
      },
    });
  }

  static async delete(id: string) {
    // Prevent deletion if class has students or exams
    const classData = await prisma.class.findUnique({
      where: { id },
      include: {
        _count: {
          select: { students: true, exams: true },
        },
      },
    });

    if (!classData) throw new Error("Class not found");

    if (classData._count.students > 0) {
      throw new Error("Cannot delete class with enrolled students");
    }

    if (classData._count.exams > 0) {
      throw new Error("Cannot delete class with scheduled exams");
    }

    return prisma.class.delete({ where: { id } });
  }

  static async assignTeacher(classId: string, teacherId: string | null) {
    return prisma.class.update({
      where: { id: classId },
      data: { teacherId: teacherId ?? null },
      include: {
        teacher: { select: { name: true, email: true } },
      },
    });
  }
}