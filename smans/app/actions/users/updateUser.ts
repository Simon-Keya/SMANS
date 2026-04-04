"use server";

import { authOptions } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { z } from "zod";

const allowedRoles = ["ADMIN", "TEACHER", "STUDENT", "PARENT", "ACCOUNTANT"] as const;

const updateUserSchema = z.object({
  name: z.string().min(2).trim().optional(),
  phone: z.string().min(9).optional(),
  role: z.enum(allowedRoles).optional(),
  staffNo: z.string().min(3).optional(),
  admissionNumber: z.string().min(3).optional(), // ← Changed
  classId: z.string().optional(),
  parentId: z.string().optional(),
  occupation: z.string().optional(),
  relationship: z.string().optional(),
  isActive: z.boolean().optional(),
});

export async function updateUser(userId: string, rawData: unknown) {
  const session = await getServerSession(authOptions);

  if (!session?.user) throw new Error("Unauthorized");

  const isAdmin = session.user.role === "ADMIN";
  const isSelf = session.user.id === userId;

  if (!isAdmin && !isSelf) throw new Error("Forbidden: You can only update your own profile");

  const data = updateUserSchema.safeParse(rawData);
  if (!data.success) {
    throw new Error(data.error.issues[0]?.message || "Invalid input");
  }

  const updateFields = data.data;

  if (updateFields.role && !isAdmin) throw new Error("Only administrators can change roles");
  if (isSelf && updateFields.role && updateFields.role !== session.user.role) {
    throw new Error("You cannot change your own role");
  }

  const updateData: any = {};

  if (updateFields.name !== undefined) updateData.name = updateFields.name.trim();
  if (updateFields.phone !== undefined) updateData.phone = updateFields.phone.trim() || null;

  if (updateFields.role !== undefined && isAdmin) updateData.role = updateFields.role;

  if (updateFields.staffNo !== undefined) updateData.staffNo = updateFields.staffNo.trim();
  if (updateFields.admissionNumber !== undefined) updateData.admissionNumber = updateFields.admissionNumber.trim(); // ← Changed
  if (updateFields.classId !== undefined) updateData.classId = updateFields.classId;
  if (updateFields.parentId !== undefined) updateData.parentId = updateFields.parentId;
  if (updateFields.occupation !== undefined) updateData.occupation = updateFields.occupation.trim();
  if (updateFields.relationship !== undefined) updateData.relationship = updateFields.relationship.trim();

  if (updateFields.isActive !== undefined && isAdmin) updateData.isActive = updateFields.isActive;

  if (Object.keys(updateData).length === 0) throw new Error("No valid fields provided");

  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        staffNo: true,
        admissionNumber: true, // ← Changed
        classId: true,
        parentId: true,
        occupation: true,
        relationship: true,
        isActive: true,
        updatedAt: true,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "UPDATE_USER",
        entity: "User",
        entityId: userId,
        metadata: { updatedFields: Object.keys(updateData), targetRole: updatedUser.role },
      },
    });

    return { success: true, user: updatedUser, message: "User updated successfully" };
  } catch (error: any) {
    console.error("Update user error:", error);
    throw new Error("Failed to update user. Please try again.");
  }
}