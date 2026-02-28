"use server";

import { authOptions } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { z } from "zod";

const updateClassSchema = z.object({
  name: z.string().min(2).trim().optional(),
  level: z.string().min(1).trim().optional(),
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

    const updated = await prisma.class.update({
      where: { id: classId },
      data,
    });

    return { success: true, class: updated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors.map(e => e.message).join(", "),
      };
    }

    console.error("[UPDATE_CLASS_ERROR]", error);
    return { success: false, error: "Failed to update class" };
  }
}