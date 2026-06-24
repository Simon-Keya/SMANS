// app/api/attendance/[id]/route.ts
import { authOptions } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/permissions";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // ✅ All authenticated users can view attendance
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;

    const record = await prisma.attendance.findUnique({
      where: { id },
      include: {
        student: {
          select: { 
            name: true, 
            admissionNumber: true,
            class: { select: { name: true } } 
          },
        },
      },
    });

    if (!record) {
      return NextResponse.json({ error: "Attendance record not found" }, { status: 404 });
    }

    return NextResponse.json(record);
  } catch (error) {
    console.error("Attendance GET error:", error);
    return NextResponse.json({ error: "Failed to fetch attendance" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // ✅ Only ADMIN and TEACHER can update attendance
    // Fix: Pass roles as an array
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

    const allowedFields = ["status"];
    const updateData = Object.fromEntries(
      Object.entries(data).filter(([key]) => allowedFields.includes(key))
    );

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
    }

    const updated = await prisma.attendance.update({
      where: { id },
      data: updateData,
      include: { 
        student: { 
          select: { name: true, admissionNumber: true }
        } 
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Attendance update error:", error);
    return NextResponse.json({ error: "Failed to update attendance" }, { status: 500 });
  }
}