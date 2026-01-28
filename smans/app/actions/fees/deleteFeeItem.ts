"use server";

import { prisma } from "@/lib/prisma";

export async function deleteFeeItem(feeItemId: string) {
  return prisma.feeItem.delete({
    where: { id: feeItemId },
  });
}
