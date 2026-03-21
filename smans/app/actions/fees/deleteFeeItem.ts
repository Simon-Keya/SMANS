// app/actions/fees/deleteFeeItem.ts
"use server";

import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

// Input validation (optional but good practice)
const deleteFeeItemSchema = {
  feeItemId: (id: unknown): id is string => typeof id === "string" && id.trim().length > 0,
};

export async function deleteFeeItem(feeItemId: string) {
  const user = await getCurrentUser();

  // 1. Authorization: only ADMIN and ACCOUNTANT can delete fee items
  if (!user || !["ADMIN", "ACCOUNTANT"].includes(user.role)) {
    throw new Error("Unauthorized: Only admins and accountants can delete fee items");
  }

  // 2. Basic input validation
  if (!deleteFeeItemSchema.feeItemId(feeItemId)) {
    throw new Error("Invalid fee item ID");
  }

  try {
    // 3. Check if the fee item exists
    const feeItem = await prisma.feeItem.findUnique({
      where: { id: feeItemId },
      select: { id: true, name: true },
    });

    if (!feeItem) {
      throw new Error("Fee item not found");
    }

    // 4. Safety check: prevent deletion if used in any invoices
    const relatedInvoicesCount = await prisma.invoice.count({
      where: { feeItemId },
    });

    if (relatedInvoicesCount > 0) {
      throw new Error(
        `Cannot delete "${feeItem.name}" — it is used in ${relatedInvoicesCount} invoice(s). ` +
        `Reassign or delete the invoices first.`
      );
    }

    // 5. Atomic delete + audit log
    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // Optional: audit log entry (your schema already has AuditLog model)
      await tx.auditLog.create({
        data: {
          userId: user.id,
          action: "DELETE_FEE_ITEM",
          entity: "FeeItem",
          entityId: feeItemId,
          metadata: {
            name: feeItem.name,
            deletedBy: user.role,
            timestamp: new Date().toISOString(),
          },
        },
      });

      // Actual deletion
      await tx.feeItem.delete({
        where: { id: feeItemId },
      });
    });

    return {
      success: true,
      message: `Fee item "${feeItem.name}" was successfully deleted`,
    };
  } catch (error: any) {
    console.error("Delete fee item error:", error);

    // User-friendly error message
    throw new Error(error.message || "Failed to delete fee item. Please try again.");
  }
}