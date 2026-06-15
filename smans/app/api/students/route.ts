// app/api/students/route.ts
import { authOptions } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized: Only admins can create students" }, { status: 401 });
  }

  try {
    const data = await request.json();

    if (!data.name || !data.admissionNumber || !data.classId) {
      return NextResponse.json({ 
        error: "Missing required fields: name, admissionNumber, classId" 
      }, { status: 400 });
    }

    // Check admission number uniqueness
    const existing = await prisma.student.findUnique({
      where: { admissionNumber: data.admissionNumber },
    });

    if (existing) {
      return NextResponse.json({ error: "Admission number already exists" }, { status: 409 });
    }

    // Create User + Student in a transaction
    const newStudent = await prisma.$transaction(async (tx) => {
      // 1. Create User account
      const hashedPassword = await bcrypt.hash(data.password || "password123", 12);

      const user = await tx.user.create({
        data: {
          name: data.name.trim(),
          email: data.email?.trim() || null,
          password: hashedPassword,
          role: "STUDENT",
          phone: data.phone?.trim() || null,
        },
      });

      // 2. Create Student record linked to User
      const student = await tx.student.create({
        data: {
          name: data.name.trim(),
          admissionNumber: data.admissionNumber.trim(),
          email: data.email?.trim() || null,
          phone: data.phone?.trim() || null,
          classId: data.classId,
          parentId: data.parentId || null,
          userId: user.id,           // Important link
        },
        include: {
          class: { select: { name: true } },
          parent: { select: { name: true, phone: true } },
          user: { select: { email: true } },
        },
      });

      return student;
    });

    return NextResponse.json({ 
      success: true, 
      message: "Student created successfully",
      data: newStudent 
    }, { status: 201 });

  } catch (error: any) {
    console.error("[CREATE_STUDENT_ERROR]", error);
    
    if (error.code === "P2002") {
      return NextResponse.json({ error: "Duplicate admission number or email" }, { status: 409 });
    }

    return NextResponse.json({ 
      error: "Failed to create student. Please try again." 
    }, { status: 500 });
  }
}