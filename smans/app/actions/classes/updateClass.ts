"use server";

import { authOptions } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { z, ZodError } from "zod";

const updateClassSchema = z.object({
  name: z.string().min(3, "Class name must be at least 3 characters").trim().optional(),
  level: z.string().min(1, "Level/grade is required").trim().optional(),
  teacherId: z.string().nullable().optional(),
});

export async function updateClass(classId: string, formData: FormData) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    return { success: false, error: "Unauthorized - admin only" };
  }

  try {
    const data = updateClassSchema.parse({
      name: formData.get("name") || undefined,
      level: formData.get("level") || undefined,
      teacherId: formData.get("teacherId") || undefined,
    });

    if (data.name || data.level) {
      const existing = await prisma.class.findFirst({
        where: {
          name: data.name || undefined,
          level: data.level || undefined,
          id: { not: classId },
        },
      });

      if (existing) {
        return { success: false, error: "A class with this name and level already exists" };
      }
    }

    const updated = await prisma.class.update({
      where: { id: classId },
      data: {
        name: data.name,
        level: data.level,
        teacherId: data.teacherId === "none" ? null : data.teacherId,
      },
      include: {
        teacher: { select: { id: true, name: true } },
      },
    });

    revalidatePath("/dashboard/classes");
    revalidatePath(`/dashboard/classes/${classId}`);

    return { success: true, data: updated };
  } catch (error) {
    if (error instanceof ZodError) {
      return {
        success: false,
        error: error.issues.map((e) => e.message).join(", "),
      };
    }

    console.error("[UPDATE_CLASS_ERROR]", error);
    return { success: false, error: "Failed to update class" };
  }
}