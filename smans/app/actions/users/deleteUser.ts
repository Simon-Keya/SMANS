"use server";

import { authOptions } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";

export async function deleteUser(userId: string) {
  const session = await getServerSession(authOptions);

  if (!session) {
    throw new Error("Unauthorized - not logged in");
  }

  // Only admins can delete users
  if (session.user.role !== "ADMIN") {          // ← FIXED: uppercase "ADMIN"
    throw new Error("Forbidden - admin access required");
  }

  // Optional: prevent self-deletion (safety)
  if (session.user.id === userId) {
    throw new Error("Cannot delete your own account");
  }

  // Optional: check if user exists first
  const userToDelete = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!userToDelete) {
    throw new Error("User not found");
  }

  await prisma.user.delete({
    where: { id: userId },
  });

  return { success: true, message: `User ${userToDelete.email} deleted` };
}