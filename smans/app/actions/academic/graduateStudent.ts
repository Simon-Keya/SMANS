"use server";

import { prisma } from "@/lib/prisma";

export async function graduateStudents(classId: string) {
  return prisma.student.updateMany({
    where: { classId },
    data: { status: "graduated" },
  });
}
