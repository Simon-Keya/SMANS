"use server";

import { prisma } from "@/lib/prisma";

export async function recordResults(
  examId: string,
  results: {
    studentId: string;
    subjectId: string;
    marks: number;
    maxMarks?: number;
  }[]
) {
  return prisma.$transaction(
    results.map(r =>
      prisma.grade.upsert({
        where: {
          // ← This is the correct unique constraint name
          studentId_subjectId_examId: {
            studentId: r.studentId,
            subjectId: r.subjectId,
            examId,
          },
        },
        update: {
          marks: r.marks,
          maxMarks: r.maxMarks ?? 100,
        },
        create: {
          studentId: r.studentId,
          subjectId: r.subjectId,
          examId,
          marks: r.marks,
          maxMarks: r.maxMarks ?? 100,
        },
      })
    )
  );
}