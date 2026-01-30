"use server";

import { logAction } from "@/app/actions/audit/logAction"; // ← optional: your audit logger
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createFeeItemSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters").trim(),
  amount: z.number().positive("Amount must be greater than 0"),
  frequency: z.enum(["once", "monthly", "termly", "yearly"], {
    errorMap: () => ({ message: "Invalid frequency. Choose: once, monthly, termly, yearly" }),
  }),
  description: z.string().max(500).optional(),
});

export async function createFeeItem(
  rawData: unknown,
  userId?: string // ← optional: pass current user ID for logging
) {
  try {
    // Validate input with Zod
    const data = createFeeItemSchema.parse(rawData);

    // Create the fee item
    const feeItem = await prisma.feeItem.create({
      data: {
        name: data.name,
        amount: data.amount,
        frequency: data.frequency,
        description: data.description ?? null,
      },
    });

    // Optional: log the action (if you have user context)
    if (userId) {
      await logAction(
        "CREATE",
        "FeeItem",
        feeItem.id,
        { name: data.name, amount: data.amount, frequency: data.frequency },
        userId
      );
    }

    return {
      success: true,
      message: "Fee item created successfully",
      data: feeItem,
    };
  } catch (error) {
    console.error("[CREATE_FEE_ITEM_ERROR]", error);

    // Zod validation error
    if (error instanceof z.ZodError) {
      return {
        success: false,
        message: "Validation failed",
        errors: error.errors.map(e => ({
          field: e.path.join("."),
          message: e.message,
        })),
      };
    }

    // General error
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to create fee item",
    };
  }
}