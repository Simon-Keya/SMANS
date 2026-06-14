// app/api/teachers/[id]/route.ts
import { authOptions } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // ✅ CRITICAL FIX: Await the params
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: "Teacher ID is required" }, { status: 400 });
    }

    const teacher = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        staffNo: true,
        role: true,
        createdAt: true,
      },
    });

    if (!teacher || teacher.role !== "TEACHER") {
      return NextResponse.json({ error: "Teacher not found" }, { status: 404 });
    }

    return NextResponse.json(teacher);
  } catch (error) {
    console.error("[GET_TEACHER_ERROR]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // ✅ CRITICAL FIX: Await the params
    const { id } = await params;
    const body = await request.json();
    const { name, email, phone, staffNo } = body;

    if (!name || !email) {
      return NextResponse.json(
        { error: "Name and email are required" },
        { status: 400 }
      );
    }

    // Check if email is already in use by another user
    const existing = await prisma.user.findFirst({
      where: {
        email: email.toLowerCase(),
        id: { not: id },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Email already in use by another user" },
        { status: 409 }
      );
    }

    const updatedTeacher = await prisma.user.update({
      where: { id },
      data: {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        phone: phone?.trim() || null,
        staffNo: staffNo?.trim() || null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        staffNo: true,
        role: true,
      },
    });

    return NextResponse.json(updatedTeacher);
  } catch (error) {
    console.error("[UPDATE_TEACHER_ERROR]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // ✅ CRITICAL FIX: Await the params
    const { id } = await params;
    
    const teacher = await prisma.user.findFirst({
      where: {
        id,
        role: "TEACHER",
      },
    });

    if (!teacher) {
      return NextResponse.json({ error: "Teacher not found" }, { status: 404 });
    }

    await prisma.user.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[DELETE_TEACHER_ERROR]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}