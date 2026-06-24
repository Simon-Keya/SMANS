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

    const userRole = session.user.role as string;
    const userId = session.user.id;
    const { id } = await params;

    // Fetch assignment with necessary relations
    const assignment = await prisma.assignment.findUnique({
      where: { id },
      include: {
        subject: {
          select: { id: true, name: true, code: true }
        },
        class: {
          select: {
            id: true,
            name: true,
            level: true,
            teacherId: true,
            teacher: { select: { id: true, name: true } },
          },
        },
        createdByUser: { select: { id: true, name: true } },
      },
    });

    if (!assignment) {
      return NextResponse.json({ error: "Assignment not found" }, { status: 404 });
    }

    // ✅ Check if user has access to this assignment
    let hasAccess = false;

    if (userRole === "ADMIN") {
      hasAccess = true;
    } else if (userRole === "TEACHER") {
      // Teacher can access if they created it or teach the class
      hasAccess = assignment.createdBy === userId || 
                  assignment.class?.teacherId === userId;
    } else if (userRole === "STUDENT") {
      // Student can access if they are in the class
      const student = await prisma.student.findFirst({
        where: {
          userId: userId,
          classId: assignment.classId,
        },
        select: { id: true },
      });
      hasAccess = !!student;
    } else if (userRole === "PARENT") {
      // Parent can access if their child is in the class
      const child = await prisma.student.findFirst({
        where: {
          classId: assignment.classId,
          parent: { userId: userId },
        },
        select: { id: true },
      });
      hasAccess = !!child;
    }

    if (!hasAccess) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
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
    // ✅ Only ADMIN and TEACHER can update assignments
    await requireRole(["ADMIN", "TEACHER"]);

    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;
    const { id } = await params;
    const body = await request.json();
    const { title, description, dueDate, subjectId, classId } = body;

    const existing = await prisma.assignment.findUnique({
      where: { id },
      include: { class: { select: { teacherId: true } } },
    });

    if (!existing) {
      return NextResponse.json({ error: "Assignment not found" }, { status: 404 });
    }

    // ✅ Teachers can only edit their own assignments
    const userRole = session?.user?.role;
    if (userRole === "TEACHER" && existing.createdBy !== userId) {
      return NextResponse.json(
        { error: "Forbidden: You can only edit your own assignments" },
        { status: 403 }
      );
    }

    // Verify class exists if being changed
    if (classId && classId !== existing.classId) {
      const classExists = await prisma.class.findUnique({
        where: { id: classId },
      });
      if (!classExists) {
        return NextResponse.json({ error: "Class not found" }, { status: 404 });
      }
    }

    // Verify subject exists if being changed
    if (subjectId && subjectId !== existing.subjectId) {
      const subjectExists = await prisma.subject.findUnique({
        where: { id: subjectId },
      });
      if (!subjectExists) {
        return NextResponse.json({ error: "Subject not found" }, { status: 404 });
      }
    }

    const updated = await prisma.assignment.update({
      where: { id },
      data: {
        title: title?.trim(),
        description: description !== undefined ? description?.trim() ?? null : undefined,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        subjectId: subjectId,
        classId: classId,
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
    // ✅ Only ADMIN and TEACHER can delete assignments
    await requireRole(["ADMIN", "TEACHER"]);

    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;
    const { id } = await params;

    const existing = await prisma.assignment.findUnique({
      where: { id },
      select: { createdBy: true },
    });

    if (!existing) {
      return NextResponse.json({ error: "Assignment not found" }, { status: 404 });
    }

    // ✅ Teachers can only delete their own assignments
    const userRole = session?.user?.role;
    if (userRole === "TEACHER" && existing.createdBy !== userId) {
      return NextResponse.json(
        { error: "Forbidden: You can only delete your own assignments" },
        { status: 403 }
      );
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