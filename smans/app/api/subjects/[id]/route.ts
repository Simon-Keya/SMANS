// app/api/subjects/[id]/route.ts
import { authOptions } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const updateSubjectSchema = z.object({
  name: z.string().min(2).trim().optional(),
  code: z.string().min(2).trim().toUpperCase().optional(),
  description: z.string().optional().nullable(),
});

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
    
    const subject = await prisma.subject.findUnique({
      where: { id },
      include: {
        classes: { select: { name: true } },
        _count: { select: { classes: true } },
      },
    });

    if (!subject) {
      return NextResponse.json({ error: "Subject not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: {
        ...subject,
        classCount: subject._count.classes,
      },
    });
  } catch (error) {
    console.error("[GET_SUBJECT]", error);
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
    const parsed = updateSubjectSchema.safeParse(body);

    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0];
      return NextResponse.json(
        { error: firstIssue?.message || "Validation failed" },
        { status: 400 }
      );
    }

    const { code } = parsed.data;

    // Optional: prevent code conflict if changing
    if (code) {
      const existing = await prisma.subject.findFirst({
        where: {
          code,
          id: { not: id },
        },
      });

      if (existing) {
        return NextResponse.json({ error: "Subject code already exists" }, { status: 409 });
      }
    }

    const updated = await prisma.subject.update({
      where: { id },
      data: parsed.data,
      include: {
        classes: { select: { name: true } },
        _count: { select: { classes: true } },
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        ...updated,
        classCount: updated._count.classes,
      },
    });
  } catch (error) {
    console.error("[UPDATE_SUBJECT]", error);
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
    
    const subject = await prisma.subject.findUnique({
      where: { id },
      include: { _count: { select: { classes: true } } },
    });

    if (!subject) {
      return NextResponse.json({ error: "Subject not found" }, { status: 404 });
    }

    // Safety check: prevent delete if linked to classes
    if (subject._count.classes > 0) {
      return NextResponse.json(
        { error: "Cannot delete subject linked to classes" },
        { status: 409 }
      );
    }

    await prisma.subject.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Subject deleted" });
  } catch (error) {
    console.error("[DELETE_SUBJECT]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}