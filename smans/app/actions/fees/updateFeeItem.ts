"use server";

import { prisma } from "@/lib/prisma";

export async function updateFeeItem(
  feeItemId: string,
  amount: number
) {
  return prisma.feeItem.update({
    where: { id: feeItemId },
    data: { amount },
  });
}
