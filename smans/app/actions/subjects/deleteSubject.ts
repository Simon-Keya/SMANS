"use server";

import { prisma } from "@/lib/prisma";

export async function deleteSubject(subjectId: string) {
  return prisma.subject.delete({
    where: { id: subjectId },
  });
}
