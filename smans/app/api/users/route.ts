// app/api/users/route.ts
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
  // Role-specific fields (optional, for creation)
  staffNo: z.string().optional(),
  admissionNumber: z.string().optional(),
  classId: z.string().optional(),
  parentId: z.string().optional(),
  occupation: z.string().optional(),
  relationship: z.string().optional(),
});

type UserWithDetails = {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  role: string;
  isActive: boolean;
  staffNo: string | null;
  createdAt: Date;
  updatedAt: Date;
  admissionNumber?: string | null;
  classId?: string | null;
  parentId?: string | null;
  occupation?: string | null;
  relationship?: string | null;
};

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        isActive: true,
        staffNo: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { name: "asc" },
    });

    // Fetch role-specific details in parallel
    const usersWithDetails = await Promise.all(
      users.map(async (user) => {
        let studentInfo = null;
        let parentInfo = null;
        
        if (user.role === "STUDENT") {
          studentInfo = await prisma.student.findUnique({
            where: { userId: user.id },
            select: { 
              admissionNumber: true, 
              classId: true, 
              parentId: true,
              name: true,
              phone: true,
              email: true,
            }
          });
        } else if (user.role === "PARENT") {
          parentInfo = await prisma.parent.findUnique({
            where: { userId: user.id },
            select: { 
              occupation: true, 
              relationship: true,
              name: true,
              phone: true,
              email: true,
            }
          });
        } else if (user.role === "TEACHER") {
          // Teacher-specific info (already in User model via staffNo)
          // Additional teacher info if needed
        }

        // For STUDENT role, use student's name/phone if available
        const displayName = studentInfo?.name || user.name;
        const displayPhone = studentInfo?.phone || user.phone;
        const displayEmail = studentInfo?.email || user.email;

        return {
          ...user,
          name: displayName,
          phone: displayPhone,
          email: displayEmail,
          admissionNumber: studentInfo?.admissionNumber || null,
          classId: studentInfo?.classId || null,
          parentId: studentInfo?.parentId || null,
          occupation: parentInfo?.occupation || null,
          relationship: parentInfo?.relationship || null,
        };
      })
    );

    return NextResponse.json({ success: true, data: usersWithDetails });
  } catch (error) {
    console.error("[GET_USERS]", error);
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
    const parsed = createUserSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid input" }, 
        { status: 400 }
      );
    }

    const { 
      name, 
      email, 
      password, 
      phone, 
      role,
      staffNo,
      admissionNumber,
      classId,
      parentId,
      occupation,
      relationship,
    } = parsed.data;

    // Check if email already exists
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Email already exists" }, { status: 409 });
    }

    // Validate role-specific required fields
    if (role === "STUDENT" && !admissionNumber) {
      return NextResponse.json({ error: "Admission number is required for students" }, { status: 400 });
    }
    if (role === "STUDENT" && !classId) {
      return NextResponse.json({ error: "Class is required for students" }, { status: 400 });
    }
    if (role === "TEACHER" && !staffNo) {
      return NextResponse.json({ error: "Staff number is required for teachers" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    // Create User and role-specific record in transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create User
      const user = await tx.user.create({
        data: {
          name: name.trim(),
          email,
          password: hashedPassword,
          phone: phone?.trim() || null,
          role,
          staffNo: role === "TEACHER" ? staffNo?.trim() : null,
          isActive: true,
          emailVerified: new Date(),
        },
        select: { 
          id: true, 
          name: true, 
          email: true, 
          phone: true, 
          role: true, 
          staffNo: true,
          createdAt: true 
        },
      });

      // 2. Create role-specific record
      if (role === "STUDENT") {
        await tx.student.create({
          data: {
            userId: user.id,
            name: name.trim(),
            admissionNumber: admissionNumber!.trim(),
            classId: classId!,
            parentId: parentId || null,
            phone: phone?.trim() || null,
            email: email,
            admissionDate: new Date(),
          },
        });
      } else if (role === "PARENT") {
        await tx.parent.create({
          data: {
            userId: user.id,
            name: name.trim(),
            phone: phone?.trim() || null,
            email: email,
            occupation: occupation?.trim() || null,
            relationship: relationship?.trim() || null,
          },
        });
      }

      // Audit log
      await tx.auditLog.create({
        data: {
          userId: session.user.id,
          action: "CREATE_USER",
          entity: "User",
          entityId: user.id,
          metadata: { 
            email: user.email, 
            role: user.role,
            admissionNumber: role === "STUDENT" ? admissionNumber : null,
          },
        },
      });

      return user;
    });

    return NextResponse.json({ success: true, data: result }, { status: 201 });
  } catch (error: any) {
    console.error("[CREATE_USER]", error);
    
    if (error.code === "P2002") {
      return NextResponse.json({ error: "Duplicate entry" }, { status: 409 });
    }
    
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}