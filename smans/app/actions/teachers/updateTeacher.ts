"use server";

import { prisma } from "@/lib/prisma";

export async function updateTeacher(
  teacherId: string,
  data: { staffNo?: string }
) {
  return prisma.teacher.update({
    where: { id: teacherId },
    data,
  });
}
