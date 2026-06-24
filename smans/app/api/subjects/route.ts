// app/api/subjects/route.ts
import { authOptions } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireRole } from "@/lib/permissions";

const createSubjectSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").trim(),
  code: z.string().min(2, "Code must be at least 2 characters").trim().toUpperCase(),
  description: z.string().optional(),
});

export async function GET() {
  // ✅ All authenticated users can view subjects
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const userRole = session.user.role as string;
    
    // Build where clause based on role
    let whereClause: any = {};

    if (userRole === "TEACHER") {
      // Teachers see subjects they teach
      const teacherClasses = await prisma.class.findMany({
        where: { teacherId: session.user.id },
        select: { subjects: { select: { id: true } } },
      });
      const subjectIds = teacherClasses.flatMap(c => c.subjects.map(s => s.id));
      whereClause = { id: { in: subjectIds } };
    } else if (userRole === "STUDENT") {
      // Students see subjects for their class
      const student = await prisma.student.findFirst({
        where: { userId: session.user.id },
        select: { class: { select: { subjects: { select: { id: true } } } } },
      });
      const subjectIds = student?.class?.subjects.map(s => s.id) || [];
      whereClause = { id: { in: subjectIds } };
    } else if (userRole === "PARENT") {
      // Parents see subjects for their children's classes
      const children = await prisma.student.findMany({
        where: { parent: { userId: session.user.id } },
        select: { class: { select: { subjects: { select: { id: true } } } } },
      });
      const subjectIds = children.flatMap(c => c.class?.subjects.map(s => s.id) || []);
      whereClause = { id: { in: subjectIds } };
    }
    // ADMIN sees all subjects (no where clause)

    const subjects = await prisma.subject.findMany({
      where: whereClause,
      include: {
        classes: { 
          select: { 
            name: true,
            level: true,
            teacher: { select: { name: true } }
          } 
        },
        _count: { select: { classes: true } },
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({
      success: true,
      data: subjects.map(s => ({
        ...s,
        classCount: s._count.classes,
      })),
    });
  } catch (error) {
    console.error("[GET_SUBJECTS]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // ✅ Only ADMIN can create subjects
    await requireRole(["ADMIN"]);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const parsed = createSubjectSchema.safeParse(body);

    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0];
      return NextResponse.json(
        { error: firstIssue?.message || "Invalid input" },
        { status: 400 }
      );
    }

    // Check if code already exists (unique constraint)
    const existing = await prisma.subject.findUnique({
      where: { code: parsed.data.code },
    });

    if (existing) {
      return NextResponse.json({ error: "Subject code already exists" }, { status: 409 });
    }

    const newSubject = await prisma.subject.create({
      data: parsed.data,
    });

    return NextResponse.json({ success: true, data: newSubject }, { status: 201 });
  } catch (error) {
    console.error("[CREATE_SUBJECT]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}