// app/api/attendance/route.ts
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

type AttendanceRecordInput = {
  studentId: string; // Must match real student ID in DB
  present: boolean;
};

export async function GET() {
  const session = await getServerSession(authOptions);
  const userRole = session?.user?.role as string | undefined;

  if (!session || !userRole || !["admin", "teacher"].includes(userRole)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get all attendance records with student info
  const records = await prisma.attendance.findMany({
    include: { student: { select: { name: true, rollNumber: true } } },
    orderBy: { date: "desc" },
  });

  return NextResponse.json(records);
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  const userRole = session?.user?.role as string | undefined;

  if (!session || !userRole || !["admin", "teacher"].includes(userRole)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { date, records }: { date: string; records: AttendanceRecordInput[] } =
    await request.json();

  if (!date || !records || !Array.isArray(records)) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  // Fetch valid student IDs from DB
  const studentIds = (
    await prisma.student.findMany({
      where: { id: { in: records.map((r) => r.studentId) } },
      select: { id: true },
    })
  ).map((s) => s.id);

  if (!studentIds.length) {
    return NextResponse.json(
      { error: "No valid student IDs found" },
      { status: 400 }
    );
  }

  // Filter out invalid IDs
  const attendanceData = records
    .filter((r) => studentIds.includes(r.studentId))
    .map((r) => ({
      studentId: r.studentId,
      date: new Date(date),
      present: r.present,
    }));

  if (!attendanceData.length) {
    return NextResponse.json(
      { error: "No valid attendance records to insert" },
      { status: 400 }
    );
  }

  // Insert attendance records, skip duplicates
  await prisma.attendance.createMany({
    data: attendanceData,
    skipDuplicates: true,
  });

  return NextResponse.json({ success: true }, { status: 201 });
}
