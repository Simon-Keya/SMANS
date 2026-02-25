// lib/services/teacher.service.ts
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

/**
 * TeacherService - Handles all teacher-related business logic
 * - Teachers are Users with role = "TEACHER"
 * - Includes staff number, assigned classes, etc.
 */
export class TeacherService {
  /**
   * Create a new teacher (creates a User with role TEACHER)
   */
  static async create(data: {
    name: string;
    email: string;
    password: string;
    staffNo?: string | null;
    phone?: string | null;
  }) {
    const { name, email, password, staffNo, phone } = data;

    // Check if email already exists
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new Error(`Email ${email} is already in use`);
    }

    // Check if staff number is unique (if provided)
    if (staffNo) {
      const existingStaff = await prisma.user.findUnique({
        where: { staffNo },
      });
      if (existingStaff) {
        throw new Error(`Staff number ${staffNo} is already in use`);
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    return prisma.user.create({
      data: {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password: hashedPassword,
        role: "TEACHER",
        staffNo: staffNo?.trim() ?? null,
        phone: phone?.trim() ?? null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        staffNo: true,
        phone: true,
        role: true,
        createdAt: true,
      },
    });
  }

  /**
   * Find teacher by ID with assigned classes
   */
  static async findById(id: string) {
    return prisma.user.findUnique({
      where: { id, role: "TEACHER" },
      include: {
        teacherClasses: {
          select: {
            id: true,
            name: true,
            level: true,
            _count: { select: { students: true } },
          },
        },
      },
    });
  }

  /**
   * Get all teachers with basic info + class count
   */
  static async findAll() {
    return prisma.user.findMany({
      where: { role: "TEACHER" },
      select: {
        id: true,
        name: true,
        email: true,
        staffNo: true,
        phone: true,
        createdAt: true,
        _count: {
          select: { teacherClasses: true },
        },
      },
      orderBy: { name: "asc" },
    });
  }

  /**
   * Update teacher details (name, staffNo, phone, etc.)
   * Password changes are handled separately
   */
  static async update(id: string, data: {
    name?: string;
    email?: string;
    staffNo?: string | null;
    phone?: string | null;
  }) {
    const { name, email, staffNo, phone } = data;

    // Validate email uniqueness if changed
    if (email) {
      const existing = await prisma.user.findFirst({
        where: {
          email: email.trim().toLowerCase(),
          id: { not: id },
        },
      });
      if (existing) throw new Error(`Email ${email} is already in use`);
    }

    // Validate staffNo uniqueness if changed
    if (staffNo) {
      const existingStaff = await prisma.user.findFirst({
        where: {
          staffNo: staffNo.trim(),
          id: { not: id },
        },
      });
      if (existingStaff) throw new Error(`Staff number ${staffNo} is already in use`);
    }

    return prisma.user.update({
      where: { id },
      data: {
        name: name ? name.trim() : undefined,
        email: email ? email.trim().toLowerCase() : undefined,
        staffNo: staffNo !== undefined ? (staffNo?.trim() ?? null) : undefined,
        phone: phone !== undefined ? (phone?.trim() ?? null) : undefined,
      },
      select: {
        id: true,
        name: true,
        email: true,
        staffNo: true,
        phone: true,
        role: true,
        updatedAt: true,
      },
    });
  }

  /**
   * Delete a teacher (only if no classes are assigned)
   */
  static async delete(id: string) {
    const teacher = await prisma.user.findUnique({
      where: { id, role: "TEACHER" },
      include: {
        _count: {
          select: { teacherClasses: true },
        },
      },
    });

    if (!teacher) throw new Error("Teacher not found");

    if (teacher._count.teacherClasses > 0) {
      throw new Error("Cannot delete teacher who is assigned to classes");
    }

    return prisma.user.delete({ where: { id } });
  }

  /**
   * Assign teacher to a class (or re-assign)
   */
  static async assignToClass(classId: string, teacherId: string) {
    // Validate teacher exists
    const teacher = await prisma.user.findUnique({
      where: { id: teacherId, role: "TEACHER" },
    });
    if (!teacher) throw new Error("Teacher not found");

    // Validate class exists
    const cls = await prisma.class.findUnique({ where: { id: classId } });
    if (!cls) throw new Error("Class not found");

    return prisma.class.update({
      where: { id: classId },
      data: { teacherId },
      include: {
        teacher: { select: { name: true, email: true } },
      },
    });
  }

  /**
   * Remove teacher from a class
   */
  static async removeFromClass(classId: string) {
    const cls = await prisma.class.findUnique({ where: { id: classId } });
    if (!cls) throw new Error("Class not found");

    return prisma.class.update({
      where: { id: classId },
      data: { teacherId: null },
      include: {
        teacher: true, // will be null now
      },
    });
  }
}