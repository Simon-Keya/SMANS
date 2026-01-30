"use server";

import { prisma } from "@/lib/prisma";

export async function generateInvoice(
  studentId: string,
  feeItemIds: string[]
) {
  // 1. Fetch the fee items
  const items = await prisma.feeItem.findMany({
    where: { id: { in: feeItemIds } },
  });

  if (items.length !== feeItemIds.length) {
    throw new Error("One or more fee items not found");
  }

  // 2. Calculate total
  const total = items.reduce((sum, item) => sum + item.amount, 0);

  // 3. Create invoice + invoice items in a transaction
  return prisma.$transaction(async (tx) => {
    const invoice = await tx.invoice.create({
      data: {
        studentId,
        amount: total,           // ← renamed 'total' to 'amount' to match schema
        status: "PENDING",       // ← FIXED: uppercase to match enum
        // Optional: due date (e.g. 30 days from now)
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        // Create invoice items (many-to-many or through relation table)
        items: {
          create: items.map(item => ({
            feeItemId: item.id,
            amount: item.amount,
          })),
        },
      },
      include: {
        items: true,
        student: { select: { name: true } },
      },
    });

    return invoice;
  });
}