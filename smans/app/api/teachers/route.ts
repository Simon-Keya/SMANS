// app/api/teachers/route.ts
import { authOptions } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import * as z from "zod";
import bcrypt from "bcryptjs";

const createTeacherSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  phone: z.string().optional(),
  staffNo: z.string().optional(),
});

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const teachers = await prisma.user.findMany({
      where: { role: "TEACHER" },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        staffNo: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json(teachers);
  } catch (error) {
    console.error("[GET_TEACHERS_ERROR]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = createTeacherSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { name, email, password, phone, staffNo } = parsed.data;

    // Check if email already exists
    const existing = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Email already exists" },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const newTeacher = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        phone: phone?.trim() || null,
        staffNo: staffNo?.trim() || null,
        role: "TEACHER",
        emailVerified: new Date(),
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        staffNo: true,
        role: true,
        createdAt: true,
      },
    });

    return NextResponse.json(newTeacher, { status: 201 });
  } catch (error) {
    console.error("[CREATE_TEACHER_ERROR]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}