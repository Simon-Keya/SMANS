import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import * as z from "zod";

const updateParentSchema = z.object({
  name: z.string().min(2).trim().optional(),
  email: z.string().email().trim().toLowerCase().optional(),
  phone: z.string().min(9).trim().optional(),
});

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const parent = await prisma.parent.findUnique({
      where: { id: params.id },
      include: {
        students: {
          select: { id: true, name: true, rollNumber: true },
        },
      },
    });

    if (!parent) {
      return NextResponse.json({ error: "Parent not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: parent });
  } catch (error) {
    console.error("[GET_PARENT]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = updateParentSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const updated = await prisma.parent.update({
      where: { id: params.id },
      data: parsed.data,
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("[UPDATE_PARENT]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const parent = await prisma.parent.findUnique({
      where: { id: params.id },
    });

    if (!parent) {
      return NextResponse.json({ error: "Parent not found" }, { status: 404 });
    }

    // Optional: delete related students or unlink them first
    await prisma.parent.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true, message: "Parent deleted" });
  } catch (error) {
    console.error("[DELETE_PARENT]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}