"use server";

import { prisma } from "@/lib/prisma";

export async function assignClass(
  studentId: string,
  classId: string
) {
  return prisma.student.update({
    where: { id: studentId },
    data: { classId },
  });
}
