// app/api/students/[id]/route.ts
import { authOptions } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userRole = session.user.role as string | undefined;

  try {
    const student = await prisma.student.findUnique({
      where: { id: params.id },
      include: {
        class: { select: { name: true } },
        parent: { select: { name: true, phone: true, userId: true } }, // FIXED: include userId
        user: { select: { email: true } },
      },
    });

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    // Access control: only admin, teacher, parent of this student, or the student themselves
    const canAccess =
      userRole === "ADMIN" ||
      userRole === "TEACHER" ||
      student.parent?.userId === session.user.id ||
      student.userId === session.user.id;

    if (!canAccess) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({ success: true, data: student });
  } catch (error) {
    console.error("[GET_STUDENT]", error);
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
    const data = await request.json();

    // Optional: add validation here (Zod schema if needed)

    const existing = await prisma.student.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    const updated = await prisma.student.update({
      where: { id: params.id },
      data,
      include: {
        class: { select: { name: true } },
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("[UPDATE_STUDENT]", error);
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
    const student = await prisma.student.findUnique({
      where: { id: params.id },
      include: { parent: { select: { userId: true } } }, // FIXED: include userId if needed
    });

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    await prisma.student.delete({
      where: { id: params.id },
    });

    // Optional: delete linked User account if exists
    if (student.userId) {
      await prisma.user.delete({
        where: { id: student.userId },
      });
    }

    return NextResponse.json({ success: true, message: "Student deleted" });
  } catch (error) {
    console.error("[DELETE_STUDENT]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}