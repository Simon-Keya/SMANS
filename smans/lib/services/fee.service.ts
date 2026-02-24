import { prisma } from "@/lib/db/prisma";
import { feeItemSchema } from "@/lib/validators/fee.schema";
import { z } from "zod";

export class FeeService {
  static async createFeeItem(data: z.infer<typeof feeItemSchema>) {
    const validated = feeItemSchema.parse(data);

    return prisma.feeItem.create({
      data: {
        name: validated.name.trim(),
        amount: validated.amount,
        frequency: validated.frequency,
        description: validated.description?.trim() ?? null,
      },
    });
  }

  static async generateInvoice(studentId: string, feeItemIds: string[]) {
    const items = await prisma.feeItem.findMany({
      where: { id: { in: feeItemIds } },
    });

    const total = items.reduce((sum, item) => sum + item.amount, 0);

    return prisma.invoice.create({
      data: {
        studentId,
        amount: total,
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        status: "PENDING",
        feeItemId: items[0]?.id ?? null, // optional
      },
    });
  }
}