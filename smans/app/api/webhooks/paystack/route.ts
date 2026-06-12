import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  return NextResponse.json({ 
    success: true, 
    message: "Paystack webhook endpoint (disabled)",
    note: "Enable by setting up Paystack credentials and uncommenting webhook code"
  }, { status: 200 });
}