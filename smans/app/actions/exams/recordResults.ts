"use server";

import { prisma } from "@/lib/prisma";

export async function recordResults(
  examId: string,
  results: {
    studentId: string;
    subjectId: string;
    marks: number;
    maxMarks: number;
  }[]
) {
  return prisma.$transaction(
    results.map(r =>
      prisma.grade.upsert({
        where: {
          studentId_examId_subjectId: {
            studentId: r.studentId,
            examId,
            subjectId: r.subjectId,
          },
        },
        update: { marks: r.marks, maxMarks: r.maxMarks },
        create: { ...r, examId },
      })
    )
  );
}
