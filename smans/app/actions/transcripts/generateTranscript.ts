"use server";

import { prisma } from "@/lib/prisma";

export async function generateTranscript(
  studentId: string,
  term: string,
  year: number
) {
  const grades = await prisma.grade.findMany({
    where: {
      studentId,
      exam: { term, year },
    },
  });

  if (!grades.length) throw new Error("No grades found");

  const total = grades.reduce((s, g) => s + g.marks / g.maxMarks, 0);
  const gpa = Number((total / grades.length * 4).toFixed(2));

  return prisma.transcript.upsert({
    where: {
      studentId_term_year: { studentId, term, year },
    },
    update: { gpa },
    create: {
      studentId,
      term,
      year,
      gpa,
      grades: { connect: grades.map(g => ({ id: g.id })) },
    },
  });
}
