// app/actions/fees/generateInvoice.ts
"use server";

import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const generateInvoiceSchema = z.object({
  studentId: z.string().min(1, "Student is required"),
  feeItemId: z.string().optional(), // optional – can be custom invoice
  amount: z.number().positive("Amount must be greater than 0"),
  dueDate: z.coerce.date().min(new Date(), "Due date must be in the future"),
  // description field removed - not in schema
});

export async function generateInvoice(input: unknown) {
  const user = await getCurrentUser();

  if (!user || !["ADMIN", "ACCOUNTANT"].includes(user.role)) {
    throw new Error("Unauthorized: Only admins and accountants can generate invoices");
  }

  const validated = generateInvoiceSchema.safeParse(input);
  if (!validated.success) {
    throw new Error(validated.error.issues[0]?.message || "Invalid input");
  }

  const { studentId, feeItemId, amount, dueDate } = validated.data;

  try {
    const invoice = await prisma.invoice.create({
      data: {
        studentId,
        feeItemId: feeItemId || null,
        amount,
        dueDate,
        // description removed - not in schema
        status: "PENDING", // matches your InvoiceStatus enum
        createdById: user.id,
        approvedById: user.role === "ACCOUNTANT" ? user.id : null,
      },
      include: {
        student: { select: { name: true } },
        feeItem: { select: { name: true } },
      },
    });

    // Create audit log to track invoice generation with any description
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "GENERATE_INVOICE",
        entity: "Invoice",
        entityId: invoice.id,
        metadata: {
          studentId,
          feeItemId,
          amount,
          dueDate: dueDate.toISOString(),
          // Store description in metadata if provided
          // description: description?.trim(),
        },
      },
    });

    return { success: true, invoice };
  } catch (error) {
    console.error("Generate invoice error:", error);
    throw new Error("Failed to generate invoice. Please try again.");
  }
}