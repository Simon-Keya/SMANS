"use server";

import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth/permissions";
import { z } from "zod";

export async function linkStudent(parentId: string, studentIds: string[]) {
  await requirePermission("students:write");

  if (!parentId?.trim()) throw new Error("Parent ID is required");
  const ids = z.array(z.string().min(1)).min(1).safeParse(studentIds);
  if (!ids.success) throw new Error("At least one valid student ID is required");

  return prisma.parent.update({
    where: { id: parentId },
    data: {
      students: {
        connect: ids.data.map((id) => ({ id })),
      },
    },
  });
}
