// app/api/structure/route.ts
import { authOptions } from "@/lib/auth/auth"; // FIXED: correct path
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const createFeeItemSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters").trim(),
  amount: z.number().min(1, "Amount must be greater than 0"),
  frequency: z.enum(["once", "monthly", "termly", "yearly"]),
  description: z.string().optional(),
});

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const items = await prisma.feeItem.findMany({
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ success: true, data: items });
  } catch (error) {
    console.error("[GET_FEE_ITEMS]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = createFeeItemSchema.safeParse(body);

    if (!parsed.success) {
      // FIXED: proper Zod error handling
      const firstIssue = parsed.error.issues[0];
      return NextResponse.json(
        { error: firstIssue?.message || "Invalid input" },
        { status: 400 }
      );
    }

    const newItem = await prisma.feeItem.create({
      data: parsed.data,
    });

    return NextResponse.json({ success: true, data: newItem }, { status: 201 });
  } catch (error) {
    console.error("[CREATE_FEE_ITEM]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}