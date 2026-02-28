"use server";

import { authOptions } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { z } from "zod";

const createClassSchema = z.object({
  name: z.string().min(2, "Class name must be at least 2 characters").trim(),
  level: z.string().min(1, "Level/grade is required").trim(),
  teacherId: z.string().optional(),
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
      teacherId: formData.get("teacherId") || undefined,
    });

    // Prevent duplicate class + level combination
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
        teacherId: data.teacherId || null,
      },
    });

    return { success: true, class: newClass };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors.map(e => e.message).join(", "),
      };
    }

    console.error("[CREATE_CLASS_ERROR]", error);
    return { success: false, error: "Failed to create class" };
  }
}