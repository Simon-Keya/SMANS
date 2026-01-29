"use server";

import { prisma } from "@/lib/prisma";

export async function deleteTeacher(teacherId: string) {
  // Teachers are Users with role TEACHER
  return prisma.user.delete({
    where: { id: teacherId },
  });
}