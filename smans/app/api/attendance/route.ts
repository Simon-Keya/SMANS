import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || !["admin", "teacher"].includes(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const records = await prisma.attendance.findMany({
    include: { student: { select: { name: true, rollNumber: true } } },
    orderBy: { date: "desc" },
  });

  return NextResponse.json(records);
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !["admin", "teacher"].includes(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { date, records } = await request.json();

  const attendanceData = records.map((r: any) => ({
    studentId: r.studentId,
    date: new Date(date),
    present: r.present,
  }));

  await prisma.attendance.createMany({
    data: attendanceData,
    skipDuplicates: true,
  });

  return NextResponse.json({ success: true }, { status: 201 });
}