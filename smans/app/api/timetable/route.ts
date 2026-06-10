import { authOptions } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const periods = await prisma.timetable.findMany({
    orderBy: [{ day: "asc" }, { startTime: "asc" }], // Changed from 'time' to 'startTime'
  });

  return NextResponse.json(periods);
}

export async function POST(request: NextRequest) { // Changed Request to NextRequest
  const session = await getServerSession(authOptions);
  const userRole = session?.user?.role as string | undefined;

  // Fixed role check to use uppercase
  if (!session || !userRole || !["ADMIN", "TEACHER"].includes(userRole.toUpperCase())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const data = await request.json();

  // Validate required fields based on your schema
  const { day, startTime, endTime, classId, subjectId, room } = data;
  
  if (!day || !startTime || !endTime || !classId || !subjectId) {
    return NextResponse.json(
      { error: "Missing required fields: day, startTime, endTime, classId, subjectId" },
      { status: 400 }
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
    }
  });

  return NextResponse.json(period, { status: 201 });
}