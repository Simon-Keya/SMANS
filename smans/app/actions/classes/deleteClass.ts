"use server";

import { authOptions } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";

export async function deleteClass(classId: string) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    return { success: false, error: "Unauthorized - admin only" };
  }

  try {
    const classToDelete = await prisma.class.findUnique({
      where: { id: classId },
      include: {
        students: { select: { id: true } },
        exams: { select: { id: true } },
        assessments: { select: { id: true } },
        assignments: { select: { id: true } },
      },
    });

    if (!classToDelete) {
      return { success: false, error: "Class not found" };
    }

    if (classToDelete.students.length > 0) {
      return { success: false, error: "Cannot delete class with enrolled students" };
    }

    if (classToDelete.exams.length > 0 || classToDelete.assessments.length > 0) {
      return { success: false, error: "Cannot delete class with existing exams or assessments" };
    }

    await prisma.class.delete({
      where: { id: classId },
    });

    return { success: true, message: "Class deleted successfully" };
  } catch (error) {
    console.error("[DELETE_CLASS_ERROR]", error);
    return { success: false, error: "Failed to delete class" };
  }
}