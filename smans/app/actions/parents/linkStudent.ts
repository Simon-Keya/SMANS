"use server";

import { prisma } from "@/lib/prisma";

export async function linkStudent(
  parentId: string,
  studentIds: string[]
) {
  return prisma.parent.update({
    where: { id: parentId },
    data: {
      students: {
        connect: studentIds.map(id => ({ id })),
      },
    },
  });
}
