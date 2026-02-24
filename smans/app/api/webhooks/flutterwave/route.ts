// app/api/webhooks/flutterwave/route.ts
// Flutterwave webhook (also popular in Kenya/East Africa)

import { logger } from "@/lib/logger";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

const flutterwaveSecret = process.env.FLUTTERWAVE_SECRET_HASH!;

export async function POST(req: NextRequest) {
  const signature = req.headers.get("verif-hash")!;

  if (signature !== flutterwaveSecret) {
    logger.warn("Invalid Flutterwave webhook signature");
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const event = body;

    switch (event.event) {
      case "charge.completed": {
        const data = event.data;
        const txRef = data.tx_ref;
        const invoiceId = data.meta?.invoiceId;

        if (invoiceId && data.status === "successful") {
          await prisma.invoice.update({
            where: { id: invoiceId },
            data: {
              status: "PAID",
              paymentDate: new Date(),
              paymentMethod: "flutterwave",
            },
          });

          logger.info(`Flutterwave payment successful`, { txRef, invoiceId });
        }

        break;
      }

      case "refund.completed":
      case "transfer.completed":
        logger.info(`Flutterwave event: ${event.event}`);
        break;

      default:
        logger.info(`Unhandled Flutterwave event: ${event.event}`);
    }

    return NextResponse.json({ status: "success" }, { status: 200 });
  } catch (err: any) {
    logger.error("Flutterwave webhook error", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}