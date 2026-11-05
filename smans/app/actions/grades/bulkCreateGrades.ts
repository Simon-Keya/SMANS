"use server";

import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth/permissions";
import { z } from "zod";

const gradeSchema = z.object({
  studentId: z.string().min(1),
  examId: z.string().min(1),
  subjectId: z.string().min(1),
  marks: z.number().min(0),
  maxMarks: z.number().positive(),
});

export async function bulkCreateGrades(
  grades: {
    studentId: string;
    examId: string;
    subjectId: string;
    marks: number;
    maxMarks: number;
  }[]
) {
  await requirePermission("grades:enter");

  if (!Array.isArray(grades) || grades.length === 0) {
    throw new Error("No grades provided");
  }
  if (grades.length > 500) {
    throw new Error("Too many grades in one batch (max 500)");
  }

  const parsed = z.array(gradeSchema).safeParse(grades);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message || "Invalid grade data");
  }

  for (const g of parsed.data) {
    if (g.marks > g.maxMarks) {
      throw new Error("Marks cannot exceed max marks");
    }
  }

  return prisma.grade.createMany({
    data: parsed.data,
    skipDuplicates: true,
  });
}
