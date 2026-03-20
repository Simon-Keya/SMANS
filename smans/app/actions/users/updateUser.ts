"use server";

import { authOptions } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { z } from "zod";

// ✅ Validation schema
const updateUserSchema = z.object({
  name: z.string().min(2).optional(),
  role: z.enum(["ADMIN", "TEACHER", "STUDENT", "PARENT"]).optional(),
});

export async function updateUser(
  userId: string,
  rawData: unknown
) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  // ✅ Validate input
  const data = updateUserSchema.parse(rawData);

  // ✅ Check if user exists
  const existingUser = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!existingUser) {
    throw new Error("User not found");
  }

  // ✅ Authorization
  const isAdmin = session.user.role === "ADMIN";
  const isSelf = session.user.id === userId;

  if (!isAdmin && !isSelf) {
    throw new Error("Forbidden");
  }

  // ✅ Prevent role change by non-admin
  if (data.role && !isAdmin) {
    throw new Error("Only admins can change roles");
  }

  // ✅ Sanitize data
  const updateData: any = {};

  if (data.name) {
    updateData.name = data.name.trim();
  }

  if (data.role && isAdmin) {
    updateData.role = data.role;
  }

  // 🚨 Nothing to update
  if (Object.keys(updateData).length === 0) {
    throw new Error("No valid fields provided");
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: updateData,
  });

  // ✅ Audit log (VERY IMPORTANT)
  await prisma.auditLog.create({
    data: {
      action: "UPDATE_USER",
      userId: session.user.id,
      targetId: userId,
      metadata: JSON.stringify(updateData),
    },
  });

  return {
    success: true,
    user: updatedUser,
  };
}