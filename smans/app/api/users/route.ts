import { authOptions } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import * as z from "zod";

const allowedRoles = ["ADMIN", "TEACHER", "STUDENT", "PARENT", "ACCOUNTANT"] as const;

const createUserSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").trim(),
  email: z.string().email("Invalid email").trim().toLowerCase(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  phone: z.string().min(9, "Phone too short").optional(),
  role: z.enum(allowedRoles),
});

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      isActive: true,
      staffNo: true,
      // Remove role-specific fields that don't exist in User model
      createdAt: true,
      updatedAt: true,
    },
    orderBy: { name: "asc" },
  });

  // If you need student/parent specific info, fetch it separately
  const usersWithDetails = await Promise.all(
    users.map(async (user) => {
      let studentInfo = null;
      let parentInfo = null;
      
      if (user.role === "STUDENT") {
        studentInfo = await prisma.student.findUnique({
          where: { userId: user.id },
          select: { admissionNumber: true, classId: true, parentId: true }
        });
      } else if (user.role === "PARENT") {
        parentInfo = await prisma.parent.findUnique({
          where: { userId: user.id },
          select: { occupation: true, relationship: true }
        });
      }
      
      return {
        ...user,
        admissionNumber: studentInfo?.admissionNumber || null,
        classId: studentInfo?.classId || null,
        parentId: studentInfo?.parentId || null,
        occupation: parentInfo?.occupation || null,
        relationship: parentInfo?.relationship || null,
      };
    })
  );

  return NextResponse.json({ success: true, data: usersWithDetails });
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = createUserSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Invalid input" }, 
      { status: 400 }
    );
  }

  const { name, email, password, phone, role } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "Email already exists" }, { status: 409 });
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const newUser = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      phone: phone?.trim() || null,
      role,
      isActive: true,
    },
    select: { 
      id: true, 
      name: true, 
      email: true, 
      phone: true, 
      role: true, 
      createdAt: true 
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: session.user.id,
      action: "CREATE_USER",
      entity: "User",
      entityId: newUser.id,
      metadata: { email: newUser.email, role: newUser.role },
    },
  });

  return NextResponse.json({ success: true, data: newUser }, { status: 201 });
}