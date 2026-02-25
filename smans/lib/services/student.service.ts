// lib/services/student.service.ts
import { prisma } from "@/lib/prisma";

export class StudentService {
  /**
   * Create a new student
   */
  static async create(data: {
    name: string;
    rollNumber: string;
    email?: string | null;
    phone?: string | null;
    classId: string;
    parentId?: string | null;
  }) {
    const { name, rollNumber, email, phone, classId, parentId } = data;

    // Check unique roll number
    const existingRoll = await prisma.student.findUnique({ where: { rollNumber } });
    if (existingRoll) throw new Error(`Roll number ${rollNumber} already exists`);

    // Validate class exists
    const cls = await prisma.class.findUnique({ where: { id: classId } });
    if (!cls) throw new Error("Class not found");

    if (parentId) {
      const parent = await prisma.parent.findUnique({ where: { id: parentId } });
      if (!parent) throw new Error("Parent not found");
    }

    return prisma.student.create({
      data: {
        name: name.trim(),
        rollNumber: rollNumber.trim(),
        email: email?.trim() ?? null,
        phone: phone?.trim() ?? null,
        classId,
        parentId: parentId ?? null,
      },
      include: {
        class: true,
        parent: true,
      },
    });
  }

  /**
   * Update student information
   */
  static async update(id: string, data: Partial<{
    name?: string;
    rollNumber?: string;
    email?: string | null;
    phone?: string | null;
    classId?: string;
    parentId?: string | null;
  }>) {
    return prisma.student.update({
      where: { id },
      data: {
        name: data.name ? data.name.trim() : undefined,
        rollNumber: data.rollNumber ? data.rollNumber.trim() : undefined,
        email: data.email !== undefined ? (data.email?.trim() ?? null) : undefined,
        phone: data.phone !== undefined ? (data.phone?.trim() ?? null) : undefined,
        classId: data.classId,
        parentId: data.parentId !== undefined ? (data.parentId ?? null) : undefined,
      },
      include: {
        class: true,
        parent: true,
      },
    });
  }

  /**
   * Delete student (soft or hard - here hard delete)
   */
  static async delete(id: string) {
    // Optional: check if student has grades/attendance before delete
    const hasRecords = await prisma.grade.count({ where: { studentId: id } });
    if (hasRecords > 0) {
      throw new Error("Cannot delete student with recorded grades");
    }

    return prisma.student.delete({ where: { id } });
  }

  /**
   * Get student with full relations
   */
  static async getById(id: string) {
    return prisma.student.findUnique({
      where: { id },
      include: {
        class: true,
        parent: true,
        grades: { include: { exam: true, subject: true } },
        attendance: true,
      },
    });
  }

  /**
   * Get all students (with optional filters)
   */
  static async getAll(filters: { classId?: string; search?: string } = {}) {
    return prisma.student.findMany({
      where: {
        classId: filters.classId,
        OR: filters.search
          ? [
              { name: { contains: filters.search, mode: "insensitive" } },
              { rollNumber: { contains: filters.search, mode: "insensitive" } },
            ]
          : undefined,
      },
      include: {
        class: { select: { name: true, level: true } },
        parent: { select: { name: true, phone: true } },
      },
      orderBy: { name: "asc" },
    });
  }
}