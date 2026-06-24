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

    const userRole = session.user.role as string;
    const userId = session.user.id;
    const { searchParams } = new URL(request.url);
    const classId = searchParams.get("classId");
    const subjectId = searchParams.get("subjectId");

    // Build where clause based on role
    let whereClause: any = {};

    if (classId) whereClause.classId = classId;
    if (subjectId) whereClause.subjectId = subjectId;

    if (userRole === "TEACHER") {
      // Teachers see assignments for their classes
      const teacherClasses = await prisma.class.findMany({
        where: { teacherId: userId },
        select: { id: true },
      });
      const classIds = teacherClasses.map(c => c.id);
      whereClause.classId = { in: classIds };
    } else if (userRole === "STUDENT") {
      // Students see assignments for their class
      const student = await prisma.student.findFirst({
        where: { userId: userId },
        select: { classId: true },
      });
      if (student) {
        whereClause.classId = student.classId;
      }
    } else if (userRole === "PARENT") {
      // Parents see assignments for their children's classes
      const children = await prisma.student.findMany({
        where: { parent: { userId: userId } },
        select: { classId: true },
      });
      const classIds = children.map(c => c.classId);
      whereClause.classId = { in: classIds };
    }
    // ADMIN sees all (no additional where clause)

    const assignments = await prisma.assignment.findMany({
      where: whereClause,
      include: {
        subject: { select: { name: true, code: true } },
        class: { select: { name: true, level: true } },
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
    // ✅ Only ADMIN and TEACHER can create assignments
    await requireRole(["ADMIN", "TEACHER"]);

    const body = await request.json();
    const session = await getServerSession(authOptions);
    const teacherId = session?.user?.id;

    const {
      title,
      description,
      dueDate,
      classId,
      subjectId,
    } = body;

    if (!title || !dueDate || !classId || !subjectId) {
      return NextResponse.json(
        { error: "Missing required fields: title, dueDate, classId, subjectId" },
        { status: 400 }
      );
    }

    if (!teacherId) {
      return NextResponse.json({ error: "Unauthorized - no user ID" }, { status: 401 });
    }

    // Verify class exists
    const classExists = await prisma.class.findUnique({
      where: { id: classId },
    });
    if (!classExists) {
      return NextResponse.json({ error: "Class not found" }, { status: 404 });
    }

    // Verify subject exists
    const subjectExists = await prisma.subject.findUnique({
      where: { id: subjectId },
    });
    if (!subjectExists) {
      return NextResponse.json({ error: "Subject not found" }, { status: 404 });
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