// app/actions/teachers/updateTeacher.ts
"use server";

import { authOptions } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { z } from "zod";

const updateTeacherSchema = z.object({
  name: z.string().min(2, "Name too short").optional(),
  staffNo: z.string().min(3, "Staff number too short").optional(),
  phone: z.string().min(9, "Phone too short").optional(),
  isActive: z.boolean().optional(),
});

export async function updateTeacher(teacherId: string, rawData: unknown) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  // Only ADMIN can update teachers (or self, but for now only admin)
  if (session.user.role !== "ADMIN") {
    throw new Error("Only administrators can update teacher details");
  }

  // Validate input
  const data = updateTeacherSchema.safeParse(rawData);
  if (!data.success) {
    throw new Error(data.error.issues[0]?.message || "Invalid input");
  }

  const updateFields = data.data;

  // Check if teacher exists
  const teacher = await prisma.user.findUnique({
    where: { id: teacherId },
    select: { id: true, role: true, name: true, email: true },
  });

  if (!teacher || teacher.role !== "TEACHER") {
    throw new Error("Teacher not found");
  }

  // Build update object
  const updateData: any = {};

  if (updateFields.name !== undefined) updateData.name = updateFields.name.trim();
  if (updateFields.staffNo !== undefined) updateData.staffNo = updateFields.staffNo.trim();
  if (updateFields.phone !== undefined) updateData.phone = updateFields.phone.trim();
  if (updateFields.isActive !== undefined) updateData.isActive = updateFields.isActive;

  if (Object.keys(updateData).length === 0) {
    throw new Error("No valid fields to update");
  }

  try {
    const updatedTeacher = await prisma.user.update({
      where: { id: teacherId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        staffNo: true,
        phone: true,
        role: true,
        isActive: true,
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "UPDATE_TEACHER",
        entity: "User",
        entityId: teacherId,
        metadata: {
          updatedFields: Object.keys(updateData),
          targetEmail: teacher.email,
        },
      },
    });

    return {
      success: true,
      teacher: updatedTeacher,
      message: "Teacher updated successfully",
    };
  } catch (error: any) {
    throw new Error(error.message || "Failed to update teacher");
  }
}