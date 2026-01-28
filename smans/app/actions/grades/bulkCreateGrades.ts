"use server";

import { prisma } from "@/lib/prisma";

export async function bulkCreateGrades(
  grades: {
    studentId: string;
    examId: string;
    subjectId: string;
    marks: number;
    maxMarks: number;
  }[]
) {
  return prisma.grade.createMany({
    data: grades,
    skipDuplicates: true,
  });
}
