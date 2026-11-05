"use server";

import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth/permissions";
import { z } from "zod";

export async function updateGrade(gradeId: string, marks: number) {
  await requirePermission("grades:enter");

  if (!gradeId?.trim()) throw new Error("Grade ID is required");
  const marksResult = z.number().min(0).safeParse(marks);
  if (!marksResult.success) throw new Error("Invalid marks");

  const existing = await prisma.grade.findUnique({
    where: { id: gradeId },
    select: { maxMarks: true },
  });
  if (!existing) throw new Error("Grade not found");
  if (marks > existing.maxMarks) {
    throw new Error("Marks cannot exceed max marks");
  }

  return prisma.grade.update({
    where: { id: gradeId },
    data: { marks },
  });
}
