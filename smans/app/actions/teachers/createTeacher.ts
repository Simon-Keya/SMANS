// app/actions/teachers/createTeacher.ts
"use server";

import { authOptions } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";
import { z } from "zod";

// Validation schema
const createTeacherSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email").toLowerCase().trim(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  staffNo: z.string().min(3, "Staff number is required"),
  phone: z.string().min(9, "Phone too short").optional(),
});

export async function createTeacher(rawData: unknown) {
  const session = await getServerSession(authOptions);

  // Only ADMIN can create teachers
  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized: Only administrators can create teachers");
  }

  // Validate input
  const data = createTeacherSchema.safeParse(rawData);
  if (!data.success) {
    throw new Error(data.error.issues[0]?.message || "Invalid input");
  }

  const { name, email, password, staffNo, phone } = data.data;

  // Check email uniqueness
  const emailExists = await prisma.user.findUnique({ where: { email } });
  if (emailExists) {
    throw new Error("Email is already in use");
  }

  // Check staffNo uniqueness (if you made it unique in schema)
  const staffNoExists = await prisma.user.findUnique({ where: { staffNo } });
  if (staffNoExists) {
    throw new Error("Staff number is already in use");
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 12);

  try {
    const newTeacher = await prisma.user.create({
      data: {
        name: name.trim(),
        email,
        password: hashedPassword,
        role: "TEACHER",
        staffNo,
        phone: phone?.trim(),
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        staffNo: true,
        phone: true,
        role: true,
        createdAt: true,
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "CREATE_TEACHER",
        entity: "User",
        entityId: newTeacher.id,
        metadata: {
          email: newTeacher.email,
          staffNo: newTeacher.staffNo,
          role: "TEACHER",
        },
      },
    });

    return {
      success: true,
      teacher: newTeacher,
      message: `Teacher "${name}" created successfully`,
    };
  } catch (error: any) {
    if (error.code === "P2002") {
      throw new Error("Duplicate email or staff number");
    }
    throw new Error("Failed to create teacher");
  }
}