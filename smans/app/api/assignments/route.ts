// app/api/assignments/route.ts
import { authOptions } from "@/lib/auth/auth";
import { logger } from "@/lib/logger";
import { requireRole } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const classId = searchParams.get("classId");
    const studentId = searchParams.get("studentId");

    const assignments = await prisma.assignment.findMany({
      where: {
        ...(classId && { classId }),
        ...(studentId && { class: { students: { some: { id: studentId } } } }),
      },
      include: {
        subject: { select: { name: true, code: true } },
        class: { select: { name: true } },
        createdByUser: { select: { name: true } },
      },
      orderBy: { dueDate: "asc" },
    });

    return NextResponse.json({ assignments });
  } catch (error) {
    logger.error("Failed to fetch assignments", error);
    return NextResponse.json(
      { error: "Failed to fetch assignments" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Fix: requireRole expects an array as a single argument
    await requireRole(["TEACHER", "ADMIN"]);

    const body = await request.json();

    const {
      title,
      description,
      dueDate,
      classId,
      subjectId,
    } = body;

    if (!title || !dueDate || !classId || !subjectId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const session = await getServerSession(authOptions);
    const teacherId = session?.user?.id;

    if (!teacherId) {
      return NextResponse.json({ error: "Unauthorized - no user ID" }, { status: 401 });
    }

    const assignment = await prisma.assignment.create({
      data: {
        title: title.trim(),
        description: description?.trim() ?? null,
        dueDate: new Date(dueDate),
        classId,
        subjectId,
        createdBy: teacherId,
      },
      include: {
        subject: true,
        class: true,
        createdByUser: { select: { name: true } },
      },
    });

    logger.info(`Assignment created`, { id: assignment.id, title });

    return NextResponse.json(assignment, { status: 201 });
  } catch (error) {
    logger.error("Failed to create assignment", error);
    return NextResponse.json(
      { error: "Failed to create assignment" },
      { status: 500 }
    );
  }
}