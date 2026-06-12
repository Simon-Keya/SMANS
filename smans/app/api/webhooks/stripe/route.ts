import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  return NextResponse.json({ 
    success: true, 
    message: "Stripe webhook endpoint (disabled)",
    note: "Enable by setting up Stripe credentials and uncommenting webhook code"
  }, { status: 200 });
}

export async function GET() {
  return NextResponse.json({ 
    message: "Stripe webhook endpoint - currently disabled" 
  }, { status: 200 });
}