"use server";

import { authOptions } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";

export async function updateUser(
  userId: string,
  data: {
    name?: string;
    role?: "ADMIN" | "TEACHER" | "STUDENT" | "PARENT"; 
  }
) {
  const session = await getServerSession(authOptions);

  if (!session) {
    throw new Error("Unauthorized");
  }

  // Admin can update anyone, users can update themselves (name only)
  if (
    session.user.role !== "ADMIN" &&                    // ← FIXED: uppercase
    session.user.id !== userId
  ) {
    throw new Error("Forbidden");
  }

  // Optional: prevent non-admins from changing role
  if (data.role && session.user.role !== "ADMIN") {
    throw new Error("Only admins can change roles");
  }

  await prisma.user.update({
    where: { id: userId },
    data,
  });

  return { success: true };
}