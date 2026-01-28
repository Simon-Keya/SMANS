"use server";

import { prisma } from "@/lib/prisma";

export async function assignTeacher(
  classId: string,
  teacherId: string
) {
  return prisma.class.update({
    where: { id: classId },
    data: {
      teacherId,
    },
  });
}
