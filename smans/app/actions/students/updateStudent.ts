// app/actions/students/updateStudent.ts
"use server";

import { authOptions } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";

export async function updateStudent(
  studentId: string,
  data: {
    name?: string;
    admissionNumber?: string;
    email?: string | null;
    phone?: string | null;
    classId?: string | null;
    parentId?: string | null;
    dateOfBirth?: Date | null;
    gender?: string | null;
    address?: string | null;
  }
) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    throw new Error("Unauthorized: Not logged in");
  }

  // Ensure admin can update
  if (session.user.role !== "ADMIN") {
    throw new Error("Forbidden: Only admins can update students");
  }

  try {
    // Build update data with proper Prisma nested relations
    const updateData: any = {
      name: data.name,
      admissionNumber: data.admissionNumber,
      email: data.email,
      phone: data.phone,
      dateOfBirth: data.dateOfBirth,
      gender: data.gender,
      address: data.address,
    };

    // Handle class relation - use connect or disconnect
    if (data.classId !== undefined) {
      if (data.classId) {
        updateData.class = { connect: { id: data.classId } };
      } else {
        updateData.class = { disconnect: true };
      }
    }

    // Handle parent relation - use connect or disconnect
    if (data.parentId !== undefined) {
      if (data.parentId) {
        updateData.parent = { connect: { id: data.parentId } };
      } else {
        updateData.parent = { disconnect: true };
      }
    }

    const updatedStudent = await prisma.student.update({
      where: { id: studentId },
      data: updateData,
      include: {
        class: { select: { id: true, name: true, level: true } },
        parent: { select: { id: true, name: true, phone: true, email: true } },
        user: { select: { id: true, email: true, name: true, phone: true } },
      },
    });

    // Revalidate paths
    revalidatePath("/dashboard/students");
    revalidatePath(`/dashboard/students/${studentId}`);

    return { success: true, data: updatedStudent };
  } catch (error: any) {
    console.error("Update student error:", error);

    if (error.code === "P2025") {
      throw new Error("Student not found");
    }

    if (error.code === "P2002") {
      throw new Error("Admission number or email already in use");
    }

    throw new Error(error.message || "Failed to update student");
  }
}