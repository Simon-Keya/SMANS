import { prisma } from "@/lib/prisma";
import { toDecimal, sumMoney, gteMoney, gtMoney } from "@/lib/money";

export type StkCallbackBody = {
  Body?: {
    stkCallback?: {
      MerchantRequestID?: string;
      CheckoutRequestID?: string;
      ResultCode?: number;
      ResultDesc?: string;
      CallbackMetadata?: {
        Item?: Array<{ Name: string; Value?: string | number }>;
      };
    };
  };
};

export function parseStkCallback(body: StkCallbackBody) {
  const cb = body?.Body?.stkCallback;
  if (!cb?.CheckoutRequestID) return null;
  const items = cb.CallbackMetadata?.Item ?? [];
  const get = (name: string) => items.find((i) => i.Name === name)?.Value;
  return {
    merchantRequestId: cb.MerchantRequestID ?? "",
    checkoutRequestId: cb.CheckoutRequestID,
    resultCode: cb.ResultCode ?? -1,
    resultDesc: cb.ResultDesc ?? "",
    amount: get("Amount"),
    mpesaReceiptNumber: String(get("MpesaReceiptNumber") ?? ""),
    phone: get("PhoneNumber"),
    transactionDate: get("TransactionDate"),
  };
}

export async function applyStkCallbackIdempotent(
  parsed: NonNullable<ReturnType<typeof parseStkCallback>>
) {
  const pending = await prisma.payment.findFirst({
    where: {
      checkoutRequestId: parsed.checkoutRequestId,
      status: "PENDING",
    },
  });

  if (!pending) {
    return { applied: false, reason: "no_pending_match" as const };
  }

  if (parsed.resultCode !== 0) {
    await prisma.payment.update({
      where: { id: pending.id },
      data: { status: "FAILED" },
    });
    return { applied: true, reason: "marked_failed" as const, paymentId: pending.id };
  }

  const amount =
    parsed.amount != null ? toDecimal(Number(parsed.amount)) : pending.amount;

  await prisma.$transaction(async (tx) => {
    const again = await tx.payment.findFirst({
      where: { id: pending.id, status: "PENDING" },
    });
    if (!again) return;

    await tx.payment.update({
      where: { id: pending.id },
      data: {
        status: "COMPLETED",
        amount,
        mpesaReceipt: parsed.mpesaReceiptNumber || null,
        method: "mpesa",
      },
    });

    const invoice = await tx.invoice.findUnique({
      where: { id: pending.invoiceId },
      include: { payments: { where: { status: "COMPLETED" } } },
    });
    if (!invoice) return;

    const totalPaid = sumMoney(
      invoice.payments.map((p) => p.amount).concat([amount])
    );
    let status: "PENDING" | "PARTIAL" | "PAID" | "OVERDUE" = "PENDING";
    if (gteMoney(totalPaid, invoice.amount)) status = "PAID";
    else if (gtMoney(totalPaid, 0)) status = "PARTIAL";

    await tx.invoice.update({
      where: { id: invoice.id },
      data: { status },
    });
  });

  return { applied: true, reason: "completed" as const, paymentId: pending.id };
}
