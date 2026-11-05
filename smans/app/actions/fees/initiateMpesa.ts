"use server";

import { requirePermission } from "@/lib/auth/permissions";
import { getCurrentUser } from "@/lib/auth/session";
import { assertCanAccessInvoice } from "@/lib/auth/ownership";
import { initiateStkPush } from "@/lib/payments/mpesa-stk";
import { z } from "zod";
import { AuditService } from "@/lib/services/audit.service";

const schema = z.object({
  invoiceId: z.string().min(1),
  amount: z.number().positive(),
  phone: z.string().min(10),
});

export async function initiateMpesaPaymentAction(input: {
  invoiceId: string;
  amount: number;
  phone: string;
}) {
  await requirePermission("fees:pay");
  await assertCanAccessInvoice(input.invoiceId, { write: true });
  const user = await getCurrentUser();
  const data = schema.parse(input);

  const result = await initiateStkPush({
    ...data,
    createdById: user?.id,
  });

  await AuditService.log(user?.id ?? null, "MPESA_STK_INIT", "Payment", result.paymentId, {
    invoiceId: data.invoiceId,
    checkoutRequestId: result.checkoutRequestId,
  });

  return result;
}
