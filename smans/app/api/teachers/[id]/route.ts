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
    const { id } = await params;
    
    const teacher = await prisma.user.findFirst({
      where: {
        id,
        role: "TEACHER",
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        staffNo: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!teacher) {
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
        isActive: true,
        createdAt: true,
        updatedAt: true,
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

    // Check if teacher has any classes assigned
    const classCount = await prisma.class.count({
      where: { teacherId: id },
    });

    if (classCount > 0) {
      return NextResponse.json(
        { error: `Cannot delete teacher with ${classCount} assigned class(es). Please reassign classes first.` },
        { status: 409 }
      );
    }

    await prisma.user.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Teacher deleted successfully" });
  } catch (error) {
    console.error("[DELETE_TEACHER_ERROR]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}