// app/api/structure/[id]/route.ts
import { authOptions } from "@/lib/auth/auth"; // FIXED: correct path
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const updateFeeItemSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters").trim().optional(),
  amount: z.number().min(1, "Amount must be greater than 0").optional(),
  frequency: z.enum(["once", "monthly", "termly", "yearly"]).optional(),
  description: z.string().optional().nullable(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const item = await prisma.feeItem.findUnique({
      where: { id: params.id },
    });

    if (!item) {
      return NextResponse.json({ error: "Fee item not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: item });
  } catch (error) {
    console.error("[GET_FEE_ITEM]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = updateFeeItemSchema.safeParse(body);

    if (!parsed.success) {
      // FIXED: proper Zod error handling
      const firstIssue = parsed.error.issues[0];
      return NextResponse.json(
        { error: firstIssue?.message || "Validation failed" },
        { status: 400 }
      );
    }

    const updated = await prisma.feeItem.update({
      where: { id: params.id },
      data: parsed.data,
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("[UPDATE_FEE_ITEM]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const item = await prisma.feeItem.findUnique({
      where: { id: params.id },
    });

    if (!item) {
      return NextResponse.json({ error: "Fee item not found" }, { status: 404 });
    }

    await prisma.feeItem.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true, message: "Fee item deleted" });
  } catch (error) {
    console.error("[DELETE_FEE_ITEM]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}