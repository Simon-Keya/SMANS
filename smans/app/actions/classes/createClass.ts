"use server";

import { authOptions } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { z, ZodError } from "zod";

const createClassSchema = z.object({
  name: z.string().min(3, "Class name must be at least 3 characters").trim(),
  level: z.string().min(1, "Level/grade is required").trim(),
  teacherId: z.string().optional().nullable(),
});

export async function createClass(formData: FormData) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    return { success: false, error: "Unauthorized - admin only" };
  }

  try {
    const data = createClassSchema.parse({
      name: formData.get("name"),
      level: formData.get("level"),
      teacherId: formData.get("teacherId") || null,
    });

    // Check for duplicate
    const existing = await prisma.class.findFirst({
      where: {
        name: data.name,
        level: data.level,
      },
    });

    if (existing) {
      return { success: false, error: "A class with this name and level already exists" };
    }

    const newClass = await prisma.class.create({
      data: {
        name: data.name,
        level: data.level,
        teacherId: data.teacherId,
      },
      include: {
        teacher: { select: { id: true, name: true } },
      },
    });

    return { success: true, class: newClass };
  } catch (err: unknown) {
    if (err instanceof ZodError) {
      return {
        success: false,
        error: err.issues.map((e) => e.message).join(", "),
      };
    }

    console.error("[CREATE_CLASS_ERROR]", err);
    return { success: false, error: "Failed to create class" };
  }
}