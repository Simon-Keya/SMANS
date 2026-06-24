// app/api/attendance/route.ts
import { authOptions } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { AttendanceStatus } from "@prisma/client";
import { requireRole } from "@/lib/permissions";

type AttendanceRecordInput = {
  studentId: string;
  classId: string;
  present: boolean;
};

export async function GET() {
  try {
    // ✅ ADMIN and TEACHER can view all attendance records
    // Fix: Pass roles as an array
    await requireRole(["ADMIN", "TEACHER"]);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const records = await prisma.attendance.findMany({
      include: {
        student: {
          select: { 
            name: true, 
            admissionNumber: true, 
            class: { select: { name: true } } 
          },
        },
      },
      orderBy: { date: "desc" },
    });

    return NextResponse.json(records);
  } catch (error) {
    console.error("Attendance GET error:", error);
    return NextResponse.json({ error: "Failed to fetch attendance" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // ✅ Only ADMIN and TEACHER can mark attendance
    // Fix: Pass roles as an array
    await requireRole(["ADMIN", "TEACHER"]);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const { date, records }: { date: string; records: AttendanceRecordInput[] } = body;

    if (!date || !records || !Array.isArray(records)) {
      return NextResponse.json({ error: "Invalid payload: date and records array required" }, { status: 400 });
    }

    // Validate student + class combinations
    const studentIds = records.map((r) => r.studentId);
    const classIds = records.map((r) => r.classId);

    const validStudents = await prisma.student.findMany({
      where: {
        id: { in: studentIds },
        classId: { in: classIds },
      },
      select: { id: true, classId: true },
    });

    const validMap = new Map(
      validStudents.map((s: { id: string; classId: string }) => [
        `${s.id}-${s.classId}`,
        true,
      ])
    );

    const validRecords = records.filter((r) => validMap.has(`${r.studentId}-${r.classId}`));

    if (validRecords.length === 0) {
      return NextResponse.json({ error: "No valid student-class combinations found" }, { status: 400 });
    }

    const attendanceData = validRecords.map((r) => ({
      studentId: r.studentId,
      classId: r.classId,
      date: new Date(date),
      status: r.present ? AttendanceStatus.PRESENT : AttendanceStatus.ABSENT,
    }));

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