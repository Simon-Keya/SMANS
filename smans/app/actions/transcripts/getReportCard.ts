"use server";

import { prisma } from "@/lib/prisma";

export async function getReportCard(studentId: string) {
  return prisma.transcript.findMany({
    where: { studentId },
    include: {
      grades: {
        include: {
          subject: true,
          exam: true,
        },
      },
    },
    orderBy: { year: "desc" },
  });
}
