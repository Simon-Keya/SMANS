// app/api/parents/[id]/route.ts
import { authOptions } from "@/lib/auth/auth"; // FIXED: correct path
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const updateParentSchema = z.object({
  name: z.string().min(2).trim().optional(),
  email: z.string().email().trim().toLowerCase().optional(),
  phone: z.string().min(9).trim().optional(),
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
    const parent = await prisma.parent.findUnique({
      where: { id: params.id },
      include: {
        students: {
          select: { id: true, name: true, rollNumber: true },
        },
        user: { select: { email: true } }, // if linked
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
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = updateParentSchema.safeParse(body);

    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0];
      return NextResponse.json(
        { error: firstIssue?.message || "Validation failed" },
        { status: 400 }
      );
    }

    const { email } = parsed.data;

    // Optional: prevent email conflict with existing users/parents
    if (email) {
      const existingUser = await prisma.user.findUnique({ where: { email } });
      const existingParent = await prisma.parent.findFirst({
        where: { email, id: { not: params.id } },
      });
      if (existingUser || existingParent) {
        return NextResponse.json({ error: "Email already in use" }, { status: 409 });
      }
    }

    const updated = await prisma.parent.update({
      where: { id: params.id },
      data: parsed.data,
      include: {
        students: { select: { name: true } },
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("[UPDATE_PARENT]", error);
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
    const parent = await prisma.parent.findUnique({
      where: { id: params.id },
      include: { students: true },
    });

    if (!parent) {
      return NextResponse.json({ error: "Parent not found" }, { status: 404 });
    }

    // Optional safety: prevent delete if linked students exist
    if (parent.students.length > 0) {
      return NextResponse.json(
        { error: "Cannot delete parent with linked students" },
        { status: 409 }
      );
    }

    // Optional: delete linked User account if exists
    if (parent.userId) {
      await prisma.user.delete({
        where: { id: parent.userId },
      });
    }

    await prisma.parent.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true, message: "Parent deleted" });
  } catch (error) {
    console.error("[DELETE_PARENT]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}