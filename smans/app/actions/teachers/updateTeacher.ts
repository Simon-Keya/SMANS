"use server";

import { prisma } from "@/lib/prisma";

export async function updateTeacher(
  teacherId: string,
  data: { staffNo?: string }
) {
  // Teachers are Users with role TEACHER
  return prisma.user.update({
    where: { id: teacherId },
    data,
  });
}