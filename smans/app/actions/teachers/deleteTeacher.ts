"use server";

import { prisma } from "@/lib/prisma";

export async function deleteTeacher(teacherId: string) {
  return prisma.teacher.delete({
    where: { id: teacherId },
  });
}
