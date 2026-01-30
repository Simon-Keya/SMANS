"use server";

import { prisma } from "@/lib/prisma";

export async function getReportCard(studentId: string) {
  // Get all transcripts for the student
  const transcripts = await prisma.transcript.findMany({
    where: { studentId },
    orderBy: { year: "desc" },
  });

  // For each transcript, fetch related grades (via student + exam/term logic)
  const reportCards = await Promise.all(
    transcripts.map(async (transcript) => {
      const grades = await prisma.grade.findMany({
        where: {
          studentId,
          exam: {
            // Optional: match term/year if exam has those fields
            term: transcript.term,
            // year: transcript.year, // if Exam has year field
          },
        },
        include: {
          subject: true,
          exam: true,
        },
      });

      return {
        ...transcript,
        grades,
      };
    })
  );

  return reportCards;
}