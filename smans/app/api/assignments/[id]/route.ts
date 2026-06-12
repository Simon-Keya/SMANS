// app/api/assignments/[id]/route.ts
import { authOptions } from "@/lib/auth/auth";
import { logger } from "@/lib/logger";
import { requireRole } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const assignment = await prisma.assignment.findUnique({
      where: { id },
      include: {
        subject: true,
        class: true,
        createdByUser: { select: { name: true } },
      },
    });

    if (!assignment) {
      return NextResponse.json({ error: "Assignment not found" }, { status: 404 });
    }

    return NextResponse.json(assignment);
  } catch (error) {
    logger.error("Failed to fetch assignment", error);
    return NextResponse.json(
      { error: "Failed to fetch assignment" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireRole(["TEACHER", "ADMIN"]);

    const { id } = await params;
    const body = await request.json();
    const { title, description, dueDate, subjectId } = body;

    const existing = await prisma.assignment.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Assignment not found" }, { status: 404 });
    }

    const updated = await prisma.assignment.update({
      where: { id },
      data: {
        title: title?.trim(),
        description: description !== undefined ? description?.trim() ?? null : undefined,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        subjectId,
      },
      include: {
        subject: true,
        class: true,
        createdByUser: { select: { name: true } },
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    logger.error("Failed to update assignment", error);
    return NextResponse.json(
      { error: "Failed to update assignment" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireRole(["TEACHER", "ADMIN"]);

    const { id } = await params;

    const existing = await prisma.assignment.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Assignment not found" }, { status: 404 });
    }

    await prisma.assignment.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error("Failed to delete assignment", error);
    return NextResponse.json(
      { error: "Failed to delete assignment" },
      { status: 500 }
    );
  }
}