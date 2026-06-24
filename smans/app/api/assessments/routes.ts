// app/api/assessments/route.ts
import { authOptions } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/permissions";

export async function GET(req: NextRequest) {
  // ✅ All authenticated users can view assessments
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const userRole = session.user.role as string;
    
    // Build where clause based on role
    let whereClause: any = {};

    if (userRole === "TEACHER") {
      // Teachers see assessments for their classes
      const teacherClasses = await prisma.class.findMany({
        where: { teacherId: session.user.id },
        select: { id: true },
      });
      const classIds = teacherClasses.map(c => c.id);
      whereClause = { classId: { in: classIds } };
    } else if (userRole === "STUDENT") {
      // Students see assessments for their class
      const student = await prisma.student.findFirst({
        where: { userId: session.user.id },
        select: { classId: true },
      });
      if (student) {
        whereClause = { classId: student.classId };
      }
    } else if (userRole === "PARENT") {
      // Parents see assessments for their children's classes
      const children = await prisma.student.findMany({
        where: { parent: { userId: session.user.id } },
        select: { classId: true },
      });
      const classIds = children.map(c => c.classId);
      whereClause = { classId: { in: classIds } };
    }
    // ADMIN sees all assessments (no where clause)

    const assessments = await prisma.assessment.findMany({
      where: whereClause,
      include: {
        learningArea: true,
        class: true,
      },
      orderBy: { date: "desc" },
    });

    return NextResponse.json(assessments);
  } catch (error) {
    console.error("[GET_ASSESSMENTS]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    // ✅ Only ADMIN and TEACHER can create assessments
    await requireRole(["ADMIN", "TEACHER"]);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();
    const assessment = await prisma.assessment.create({
      data: body,
      include: {
        learningArea: true,
        class: true,
      },
    });

    return NextResponse.json({ success: true, assessment }, { status: 201 });
  } catch (error) {
    console.error("[CREATE_ASSESSMENT]", error);
    return NextResponse.json({ error: "Failed to create assessment" }, { status: 500 });
  }
}