// app/api/webhooks/stripe/route.ts
// Stripe webhook handler (e.g. payment succeeded, subscription created, etc.)

import { logger } from "@/lib/logger";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  const sig = req.headers.get("stripe-signature")!;

  let event: Stripe.Event;

  try {
    const body = await req.text();

    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);

    // Handle the event
    switch (event.type) {
      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const invoiceId = paymentIntent.metadata.invoiceId;

        if (invoiceId) {
          await prisma.invoice.update({
            where: { id: invoiceId },
            data: {
              status: "PAID",
              paymentDate: new Date(),
            },
          });

          logger.info(`Payment succeeded for invoice ${invoiceId}`, {
            paymentIntentId: paymentIntent.id,
          });
        }

        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        const studentId = invoice.metadata.studentId;

        if (studentId) {
          // Optional: mark related invoices as paid, send receipt email, etc.
          logger.info(`Invoice payment succeeded`, { invoiceId: invoice.id });
        }

        break;
      }

      default:
        logger.info(`Unhandled Stripe event type: ${event.type}`);
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (err: any) {
    logger.error("Stripe webhook error", err);
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    );
  }
}