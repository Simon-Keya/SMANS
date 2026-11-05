// app/api/webhooks/mpesa/route.ts
// Safaricom Daraja STK callback — public, no session.
// Always respond 200 after parse so Safaricom does not retry forever.

import { NextRequest, NextResponse } from "next/server";
import {
  parseStkCallback,
  applyStkCallbackIdempotent,
} from "@/lib/payments/mpesa";

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    // Unparseable — still 200 per gateway guidance once we attempted parse
    return NextResponse.json({ ResultCode: 1, ResultDesc: "Invalid JSON" });
  }

  const parsed = parseStkCallback(body as any);
  if (!parsed) {
    return NextResponse.json({ ResultCode: 1, ResultDesc: "Invalid callback" });
  }

  try {
    await applyStkCallbackIdempotent(parsed);
  } catch (e) {
    console.error("[mpesa callback]", e);
    // Still 200 so gateway stops; log for ops
  }

  return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });
}
