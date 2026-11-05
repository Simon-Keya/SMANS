"use server";

import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth/permissions";

export async function assignClass(studentId: string, classId: string) {
  await requirePermission("students:write");

  if (!studentId?.trim() || !classId?.trim()) {
    throw new Error("Student ID and class ID are required");
  }

  return prisma.student.update({
    where: { id: studentId },
    data: { classId },
  });
}
