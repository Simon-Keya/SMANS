import { prisma } from "@/lib/db/prisma";
import { teacherSchema } from "@/lib/validators/teacher.schema";
import { z } from "zod";

type TeacherCreateInput = z.infer<typeof teacherSchema>;

export class TeacherService {
  static async create(data: TeacherCreateInput) {
    const validated = teacherSchema.parse(data);

    return prisma.user.create({
      data: {
        name: validated.name.trim(),
        email: validated.email.trim(),
        password: validated.password, // assume already hashed outside
        role: "TEACHER",
        staffNo: validated.staffNo?.trim() ?? null,
      },
    });
  }

  static async findById(id: string) {
    return prisma.user.findUnique({
      where: { id, role: "TEACHER" },
      include: {
        teacherClasses: true,
      },
    });
  }

  static async findAll() {
    return prisma.user.findMany({
      where: { role: "TEACHER" },
      select: {
        id: true,
        name: true,
        email: true,
        staffNo: true,
        teacherClasses: { select: { name: true, level: true } },
      },
      orderBy: { name: "asc" },
    });
  }

  static async update(id: string, data: Partial<TeacherCreateInput>) {
    const validated = teacherSchema.partial().parse(data);

    return prisma.user.update({
      where: { id },
      data: validated,
    });
  }

  static async delete(id: string) {
    return prisma.user.delete({ where: { id } });
  }
}