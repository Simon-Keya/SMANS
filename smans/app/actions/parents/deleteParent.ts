"use server";

import { prisma } from "@/lib/prisma";

export async function deleteParent(parentId: string) {
  return prisma.parent.delete({
    where: { id: parentId },
  });
}
