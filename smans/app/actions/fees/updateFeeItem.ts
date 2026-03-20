"use server";

import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateFeeItemSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1, "Name is required"),
  amount: z.number().positive("Amount must be positive"),
  frequency: z.enum(["ONCE", "MONTHLY", "TERM", "YEARLY"]),
  description: z.string().optional(),
});

export async function updateFeeItemAction(input: unknown) {
  const user = await getCurrentUser();

  if (!user || !["ADMIN", "ACCOUNTANT"].includes(user.role)) {
    throw new Error("Unauthorized: Only admins and accountants can update fee items");
  }

  const validated = updateFeeItemSchema.safeParse(input);
  if (!validated.success) {
    throw new Error(validated.error.issues[0]?.message || "Invalid input");
  }

  const { id, ...data } = validated.data;

  try {
    const feeItem = await prisma.feeItem.update({
      where: { id },
      data: {
        name: data.name.trim(),
        amount: data.amount,
        frequency: data.frequency,
        description: data.description?.trim(),
      },
    });

    return { success: true, feeItem };
  } catch (error) {
    console.error("Update fee item error:", error);
    throw new Error("Failed to update fee item. Please try again.");
  }
}