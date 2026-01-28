"use server";

import { prisma } from "@/lib/prisma";

export async function updateClass(
  classId: string,
  data: Partial<{ name: string; level: string }>
) {
  return prisma.class.update({
    where: { id: classId },
    data,
  });
}
