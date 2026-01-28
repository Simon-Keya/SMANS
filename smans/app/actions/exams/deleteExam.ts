"use server";

import { prisma } from "@/lib/prisma";

export async function deleteExam(examId: string) {
  return prisma.exam.delete({
    where: { id: examId },
  });
}
