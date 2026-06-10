import { authOptions } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

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
  const session = await getServerSession(authOptions);
  const userRole = session?.user?.role as string | undefined;

  if (!session || !userRole || !["ADMIN", "TEACHER"].includes(userRole.toUpperCase())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
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

    const updated = await prisma.timetable.update({
      where: { id },
      data,
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
  const session = await getServerSession(authOptions);
  const userRole = session?.user?.role as string | undefined;

  if (!session || userRole !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
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