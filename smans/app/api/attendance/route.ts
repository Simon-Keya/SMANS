// app/api/attendance/route.ts
import { authOptions } from "@/lib/auth/auth"; // correct import path
import { prisma } from "@/lib/prisma";
import { AttendanceStatus } from "@prisma/client"; // ← import the enum
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

type AttendanceRecordInput = {
  studentId: string;
  classId: string;
  present: boolean;
};

export async function GET() {
  const session = await getServerSession(authOptions);
  const userRole = session?.user?.role as string | undefined;

  if (!session || !userRole || !["ADMIN", "TEACHER"].includes(userRole)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const records = await prisma.attendance.findMany({
    include: {
      student: {
        select: { name: true, rollNumber: true, class: { select: { name: true } } },
      },
    },
    orderBy: { date: "desc" },
  });

  return NextResponse.json(records);
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  const userRole = session?.user?.role as string | undefined;

  if (!session || !userRole || !["ADMIN", "TEACHER"].includes(userRole)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const { date, records }: { date: string; records: AttendanceRecordInput[] } = body;

  if (!date || !records || !Array.isArray(records)) {
    return NextResponse.json({ error: "Invalid payload: date and records array required" }, { status: 400 });
  }

  // Validate student + class combinations
  const studentIds = records.map(r => r.studentId);
  const classIds = records.map(r => r.classId);

  const validStudents = await prisma.student.findMany({
    where: {
      id: { in: studentIds },
      classId: { in: classIds },
    },
    select: { id: true, classId: true },
  });

  const validMap = new Map(validStudents.map(s => [`${s.id}-${s.classId}`, true]));

  const validRecords = records.filter(r => validMap.has(`${r.studentId}-${r.classId}`));

  if (validRecords.length === 0) {
    return NextResponse.json({ error: "No valid student-class combinations found" }, { status: 400 });
  }

  const attendanceData = validRecords.map(r => ({
    studentId: r.studentId,
    classId: r.classId,
    date: new Date(date),
    status: r.present ? AttendanceStatus.PRESENT : AttendanceStatus.ABSENT, // ← FIXED: use enum
  }));

  try {
    await prisma.attendance.createMany({
      data: attendanceData,
      skipDuplicates: true,
    });

    return NextResponse.json({ success: true, count: attendanceData.length }, { status: 201 });
  } catch (error) {
    console.error("Attendance create error:", error);
    return NextResponse.json({ error: "Failed to record attendance" }, { status: 500 });
  }
}