import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  return NextResponse.json({ 
    success: true, 
    message: "Flutterwave webhook endpoint (disabled)",
    note: "Enable by setting up Flutterwave credentials and uncommenting webhook code"
  }, { status: 200 });
}