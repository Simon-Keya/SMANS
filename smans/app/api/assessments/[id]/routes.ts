// app/api/assessments/[id]/route.ts
import { authOptions } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/permissions";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // ✅ All authenticated users can view assessment details
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    
    const assessment = await prisma.assessment.findUnique({
      where: { id },
      include: {
        learningArea: true,
        class: true,
      },
    });

    if (!assessment) {
      return NextResponse.json({ error: "Assessment not found" }, { status: 404 });
    }

    return NextResponse.json(assessment);
  } catch (error) {
    console.error("[GET_ASSESSMENT]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // ✅ Only ADMIN and TEACHER can update assessments
    await requireRole(["ADMIN", "TEACHER"]);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const { id } = await params;
    const body = await req.json();
    
    const assessment = await prisma.assessment.update({
      where: { id },
      data: body,
      include: {
        learningArea: true,
        class: true,
      },
    });

    return NextResponse.json({ success: true, assessment });
  } catch (error) {
    console.error("[UPDATE_ASSESSMENT]", error);
    return NextResponse.json({ error: "Failed to update assessment" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // ✅ Only ADMIN and TEACHER can delete assessments
    await requireRole(["ADMIN", "TEACHER"]);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const { id } = await params;
    
    await prisma.assessment.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[DELETE_ASSESSMENT]", error);
    return NextResponse.json({ error: "Failed to delete assessment" }, { status: 500 });
  }
}