"use server";

import { prisma } from "@/lib/prisma";

export async function deleteClass(classId: string) {
  return prisma.class.delete({
    where: { id: classId },
  });
}
