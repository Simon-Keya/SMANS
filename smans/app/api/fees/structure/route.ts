import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import * as z from "zod";

const createFeeItemSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters").trim(),
  amount: z.number().min(1, "Amount must be greater than 0"),
  frequency: z.enum(["once", "monthly", "termly", "yearly"]),
  description: z.string().optional(),
});

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const items = await prisma.feeItem.findMany({
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ success: true, data: items });
  } catch (error) {
    console.error("[GET_FEE_STRUCTURE]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = createFeeItemSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
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