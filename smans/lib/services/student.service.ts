// lib/services/student.service.ts
import { prisma } from "@/lib/prisma";

export class StudentService {
  /**
   * Create a new student
   */
  static async create(data: {
    name: string;
    admissionNumber: string; // Changed from rollNumber
    email?: string | null;
    phone?: string | null;
    classId: string;
    parentId?: string | null;
  }) {
    const { name, admissionNumber, email, phone, classId, parentId } = data;

    // Check unique admission number
    const existingAdmission = await prisma.student.findUnique({ 
      where: { admissionNumber } 
    });
    if (existingAdmission) throw new Error(`Admission number ${admissionNumber} already exists`);

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
        admissionNumber: admissionNumber.trim(),
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
    admissionNumber?: string;
    email?: string | null;
    phone?: string | null;
    classId?: string;
    parentId?: string | null;
  }>) {
    return prisma.student.update({
      where: { id },
      data: {
        name: data.name ? data.name.trim() : undefined,
        admissionNumber: data.admissionNumber ? data.admissionNumber.trim() : undefined,
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
   * Delete student (hard delete)
   */
  static async delete(id: string) {
    // Check if student has grades/attendance before delete
    const hasGrades = await prisma.grade.count({ where: { studentId: id } });
    if (hasGrades > 0) {
      throw new Error("Cannot delete student with recorded grades");
    }

    const hasAttendance = await prisma.attendance.count({ where: { studentId: id } });
    if (hasAttendance > 0) {
      throw new Error("Cannot delete student with attendance records");
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
        class: { select: { id: true, name: true, level: true } },
        parent: { select: { id: true, name: true, phone: true, email: true } },
        user: { select: { id: true, email: true } },
        grades: { 
          include: { 
            exam: { select: { name: true, term: true, year: true } }, 
            subject: { select: { name: true, code: true } } 
          } 
        },
        attendance: { orderBy: { date: "desc" }, take: 10 },
        invoices: { where: { status: { not: "PAID" } } },
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
              { admissionNumber: { contains: filters.search, mode: "insensitive" } },
              { email: { contains: filters.search, mode: "insensitive" } },
            ]
          : undefined,
      },
      include: {
        class: { select: { name: true, level: true } },
        parent: { select: { name: true, phone: true, email: true } },
        _count: { select: { grades: true, attendance: true } },
      },
      orderBy: { name: "asc" },
    });
  }

  /**
   * Get students by class
   */
  static async getByClass(classId: string) {
    return prisma.student.findMany({
      where: { classId },
      include: {
        parent: { select: { name: true, phone: true } },
      },
      orderBy: { name: "asc" },
    });
  }

  /**
   * Search students by admission number or name
   */
  static async search(query: string) {
    return prisma.student.findMany({
      where: {
        OR: [
          { admissionNumber: { contains: query, mode: "insensitive" } },
          { name: { contains: query, mode: "insensitive" } },
        ],
      },
      include: {
        class: { select: { name: true, level: true } },
      },
      take: 10,
    });
  }
}