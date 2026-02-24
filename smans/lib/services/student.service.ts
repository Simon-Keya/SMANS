import { prisma } from "@/lib/db/prisma";
import { studentSchema } from "@/lib/validators/student.schema";
import { z } from "zod";

type StudentCreateInput = z.infer<typeof studentSchema>;

export class StudentService {
  static async create(data: StudentCreateInput) {
    const validated = studentSchema.parse(data);

    return prisma.student.create({
      data: {
        name: validated.name.trim(),
        rollNumber: validated.rollNumber.trim(),
        email: validated.email?.trim() ?? null,
        phone: validated.phone?.trim() ?? null,
        classId: validated.classId,
        parentId: validated.parentId ?? null,
      },
    });
  }

  static async findById(id: string) {
    return prisma.student.findUnique({
      where: { id },
      include: {
        class: true,
        parent: true,
        user: true,
      },
    });
  }

  static async findAll() {
    return prisma.student.findMany({
      include: {
        class: { select: { name: true, level: true } },
        parent: { select: { name: true, phone: true } },
      },
      orderBy: { name: "asc" },
    });
  }

  static async update(id: string, data: Partial<StudentCreateInput>) {
    const validated = studentSchema.partial().parse(data);

    return prisma.student.update({
      where: { id },
      data: validated,
    });
  }

  static async delete(id: string) {
    return prisma.student.delete({ where: { id } });
  }

  static async assignClass(studentId: string, classId: string) {
    return prisma.student.update({
      where: { id: studentId },
      data: { classId },
    });
  }
}