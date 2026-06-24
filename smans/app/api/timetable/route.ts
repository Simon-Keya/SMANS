// app/api/timetable/route.ts
import { authOptions } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/permissions";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const userRole = session.user.role as string;
    const userId = session.user.id;

    // Build where clause based on role
    let whereClause: any = {};

    if (userRole === "TEACHER") {
      const teacherClasses = await prisma.class.findMany({
        where: { teacherId: userId },
        select: { id: true },
      });
      const classIds = teacherClasses.map(c => c.id);
      whereClause = { classId: { in: classIds } };
    } else if (userRole === "STUDENT") {
      const student = await prisma.student.findFirst({
        where: { userId: userId },
        select: { classId: true },
      });
      if (student) {
        whereClause = { classId: student.classId };
      }
    } else if (userRole === "PARENT") {
      const children = await prisma.student.findMany({
        where: { parent: { userId: userId } },
        select: { classId: true },
      });
      const classIds = children.map(c => c.classId);
      whereClause = { classId: { in: classIds } };
    }
    // ADMIN sees all (no where clause)

    const periods = await prisma.timetable.findMany({
      where: whereClause,
      include: {
        subject: { select: { name: true, code: true } },
        class: { select: { name: true, level: true } },
      },
      orderBy: [{ day: "asc" }, { startTime: "asc" }],
    });

    return NextResponse.json(periods);
  } catch (error) {
    console.error("GET timetable error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // ✅ Only ADMIN and TEACHER can create timetable entries
    await requireRole(["ADMIN", "TEACHER"]);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const data = await request.json();
    const { day, startTime, endTime, classId, subjectId, room } = data;
    
    if (!day || !startTime || !endTime || !classId || !subjectId) {
      return NextResponse.json(
        { error: "Missing required fields: day, startTime, endTime, classId, subjectId" },
        { status: 400 }
      );
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

    // Check for conflicting timetable entry
    const conflict = await prisma.timetable.findFirst({
      where: {
        classId,
        day,
        OR: [
          {
            startTime: { lt: endTime },
            endTime: { gt: startTime },
          },
        ],
      },
    });

    if (conflict) {
      return NextResponse.json(
        { error: `Time conflict: Another period exists on ${day} between ${conflict.startTime} and ${conflict.endTime}` },
        { status: 409 }
      );
    }

    const period = await prisma.timetable.create({ 
      data: {
        day,
        startTime,
        endTime,
        room: room || null,
        classId,
        subjectId,
      },
      include: {
        subject: { select: { name: true, code: true } },
        class: { select: { name: true, level: true } },
      },
    });

    return NextResponse.json(period, { status: 201 });
  } catch (error) {
    console.error("POST timetable error:", error);
    return NextResponse.json({ error: "Failed to create timetable period" }, { status: 500 });
  }
}