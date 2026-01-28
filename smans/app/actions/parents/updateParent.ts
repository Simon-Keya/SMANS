"use server";

import { prisma } from "@/lib/prisma";

export async function updateParent(
  parentId: string,
  name: string
) {
  return prisma.parent.update({
    where: { id: parentId },
    data: {
      user: {
        update: { name },
      },
    },
  });
}
