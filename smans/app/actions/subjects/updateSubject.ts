"use server";

import { prisma } from "@/lib/prisma";

export async function updateSubject(
  subjectId: string,
  data: Partial<{ name: string; code: string }>
) {
  return prisma.subject.update({
    where: { id: subjectId },
    data,
  });
}
