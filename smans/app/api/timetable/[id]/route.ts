// app/api/timetable/[id]/route.ts
import { authOptions } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/permissions";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    
    const period = await prisma.timetable.findUnique({
      where: { id },
      include: {
        subject: { select: { name: true, code: true } },
        class: { select: { name: true, level: true } },
      },
    });

    if (!period) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(period);
  } catch (error) {
    console.error("GET timetable period error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // ✅ Only ADMIN and TEACHER can update timetable entries
    await requireRole(["ADMIN", "TEACHER"]);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const { id } = await params;
    const data = await request.json();

    // Validate that the period exists
    const existing = await prisma.timetable.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Period not found" }, { status: 404 });
    }

    // Check for conflicts if day or time is being changed
    if (data.day || data.startTime || data.endTime) {
      const conflict = await prisma.timetable.findFirst({
        where: {
          id: { not: id },
          classId: data.classId || existing.classId,
          day: data.day || existing.day,
          OR: [
            {
              startTime: { lt: data.endTime || existing.endTime },
              endTime: { gt: data.startTime || existing.startTime },
            },
          ],
        },
      });

      if (conflict) {
        return NextResponse.json(
          { error: `Time conflict: Another period exists on ${data.day || existing.day} between ${conflict.startTime} and ${conflict.endTime}` },
          { status: 409 }
        );
      }
    }

    const updated = await prisma.timetable.update({
      where: { id },
      data: {
        day: data.day,
        startTime: data.startTime,
        endTime: data.endTime,
        room: data.room,
        classId: data.classId,
        subjectId: data.subjectId,
      },
      include: {
        subject: { select: { name: true, code: true } },
        class: { select: { name: true, level: true } },
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("PUT timetable period error:", error);
    return NextResponse.json({ error: "Failed to update period" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // ✅ Only ADMIN can delete timetable entries
    await requireRole(["ADMIN"]);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const { id } = await params;
    
    const existing = await prisma.timetable.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Period not found" }, { status: 404 });
    }

    await prisma.timetable.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE timetable period error:", error);
    return NextResponse.json({ error: "Failed to delete period" }, { status: 500 });
  }
}