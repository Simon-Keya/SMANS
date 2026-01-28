"use server";

import { prisma } from "@/lib/prisma";

export async function generateGradeReport(
  examId: string
) {
  return prisma.grade.findMany({
    where: { examId },
    include: {
      student: true,
      subject: true,
    },
  });
}
