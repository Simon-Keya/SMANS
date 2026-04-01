// app/api/assessments/route.ts
import { authOptions } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || !["ADMIN", "TEACHER"].includes(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const assessments = await prisma.assessment.findMany({
    include: {
      learningArea: true,
      class: true,
    },
    orderBy: { date: "desc" },
  });

  return NextResponse.json(assessments);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || !["ADMIN", "TEACHER"].includes(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const assessment = await prisma.assessment.create({
      data: body,
      include: {
        learningArea: true,
        class: true,
      },
    });

    return NextResponse.json({ success: true, assessment }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create assessment" }, { status: 500 });
  }
}