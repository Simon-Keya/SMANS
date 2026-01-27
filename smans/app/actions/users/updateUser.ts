"use server";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";

export async function updateUser(
  userId: string,
  data: {
    name?: string;
    role?: "admin" | "teacher" | "student" | "parent";
  }
) {
  const session = await getServerSession(authOptions);

  if (!session) {
    throw new Error("Unauthorized");
  }

  // Admin can update anyone, users can update themselves (name only)
  if (
    session.user.role !== "admin" &&
    session.user.id !== userId
  ) {
    throw new Error("Forbidden");
  }

  await prisma.user.update({
    where: { id: userId },
    data,
  });

  return { success: true };
}
