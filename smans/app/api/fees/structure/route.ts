import { authOptions } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const createFeeItemSchema = z.object({
  name: z.string().min(1),
  amount: z.number().positive(),
  frequency: z.enum(["ONCE", "MONTHLY", "TERM", "YEARLY"]),
  description: z.string().optional(),
});

// GET: List all fee items
export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || !["ADMIN", "ACCOUNTANT"].includes(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const feeItems = await prisma.feeItem.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        amount: true,
        frequency: true,
        description: true,
      },
    });

    return NextResponse.json(feeItems);
  } catch (error) {
    console.error("GET /api/fees/structure error:", error);
    return NextResponse.json({ error: "Failed to fetch fee items" }, { status: 500 });
  }
}

// POST: Create new fee item
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || !["ADMIN", "ACCOUNTANT"].includes(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const validated = createFeeItemSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: validated.error.issues[0]?.message || "Invalid input" },
        { status: 400 }
      );
    }

    const data = validated.data;

    const feeItem = await prisma.feeItem.create({
      data: {
        name: data.name.trim(),
        amount: data.amount,
        frequency: data.frequency,
        description: data.description?.trim(),
      },
    });

    return NextResponse.json({ success: true, feeItem }, { status: 201 });
  } catch (error) {
    console.error("POST /api/fees/structure error:", error);
    return NextResponse.json({ error: "Failed to create fee item" }, { status: 500 });
  }
}