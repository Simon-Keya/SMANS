"use server";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth"; // ← FIXED for v5

export async function assignTeacherToClass(classId: string, teacherId: string | null) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    return { success: false, error: "Unauthorized - admin only" };
  }

  try {
    // Optional: validate teacher exists (if provided)
    if (teacherId) {
      const teacher = await prisma.user.findUnique({
        where: { id: teacherId, role: "TEACHER" },
      });
      if (!teacher) {
        return { success: false, error: "Teacher not found or not a teacher" };
      }
    }

    const updatedClass = await prisma.class.update({
      where: { id: classId },
      data: {
        teacherId: teacherId || null,
      },
      include: {
        teacher: { select: { name: true, email: true } },
      },
    });

    return { success: true, class: updatedClass };
  } catch (error) {
    console.error("[ASSIGN_TEACHER_ERROR]", error);
    return { success: false, error: "Failed to assign teacher" };
  }
}