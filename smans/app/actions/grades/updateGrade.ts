"use server";

import { prisma } from "@/lib/prisma";

export async function updateGrade(
  gradeId: string,
  marks: number
) {
  return prisma.grade.update({
    where: { id: gradeId },
    data: { marks },
  });
}
