"use server";

import { prisma } from "@/lib/prisma";

export async function generateInvoice(
  studentId: string,
  feeItemIds: string[]
) {
  const items = await prisma.feeItem.findMany({
    where: { id: { in: feeItemIds } },
  });

  const total = items.reduce((s, i) => s + i.amount, 0);

  return prisma.invoice.create({
    data: {
      studentId,
      total,
      status: "pending",
      items: {
        create: items.map(i => ({
          feeItemId: i.id,
          amount: i.amount,
        })),
      },
    },
  });
}
