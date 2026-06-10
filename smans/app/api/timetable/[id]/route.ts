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

  const { id } = await params;
  
  const period = await prisma.timetable.findUnique({
    where: { id },
  });

  if (!period) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(period);
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

  const { id } = await params;
  const data = await request.json();

  const updated = await prisma.timetable.update({
    where: { id },
    data,
  });

  return NextResponse.json(updated);
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

  const { id } = await params;
  
  await prisma.timetable.delete({ where: { id } });

  return NextResponse.json({ success: true });
}