"use server";

import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth/permissions";

export async function deleteParent(parentId: string) {
  await requirePermission("users:write");
  if (!parentId?.trim()) throw new Error("Parent ID is required");

  return prisma.parent.delete({
    where: { id: parentId },
  });
}
