// app/api/webhooks/paystack/route.ts
// Paystack webhook handler (very common in Kenya)

import { logger } from "@/lib/logger";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";

const paystackSecret = process.env.PAYSTACK_SECRET_KEY!;

export async function POST(req: NextRequest) {
  const signature = req.headers.get("x-paystack-signature")!;

  try {
    const body = await req.text();

    // Verify signature
    const hash = crypto
      .createHmac("sha512", paystackSecret)
      .update(body)
      .digest("hex");

    if (hash !== signature) {
      logger.warn("Invalid Paystack webhook signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const event = JSON.parse(body);

    // Handle events
    switch (event.event) {
      case "charge.success": {
        const data = event.data;
        const reference = data.reference;
        const invoiceId = data.metadata?.invoiceId;

        if (invoiceId) {
          await prisma.invoice.update({
            where: { id: invoiceId },
            data: {
              status: "PAID",
              paymentDate: new Date(),
              paymentMethod: "paystack",
            },
          });

          logger.info(`Paystack payment successful`, { reference, invoiceId });
        }

        break;
      }

      case "transfer.success":
      case "invoice.update":
        // Handle refunds, invoice updates, etc.
        logger.info(`Paystack event: ${event.event}`);
        break;

      default:
        logger.info(`Unhandled Paystack event: ${event.event}`);
    }

    return NextResponse.json({ status: "success" }, { status: 200 });
  } catch (err: any) {
    logger.error("Paystack webhook error", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}