"use server";

import { prisma } from "@/lib/prisma";

export async function updateExam(
  examId: string,
  data: Partial<{ name: string; term: string; year: number }>
) {
  return prisma.exam.update({
    where: { id: examId },
    data,
  });
}
