// app/actions/teachers/deleteTeacher.ts
"use server";

import { authOptions } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client"; // ← this import gives Prisma.TransactionClient
import { getServerSession } from "next-auth";

export async function deleteTeacher(teacherId: string) {
  const session = await getServerSession(authOptions);

  // 1. Must be logged in
  if (!session?.user) {
    throw new Error("Unauthorized – please log in");
  }

  // 2. Only ADMIN can delete teachers
  if (session.user.role !== "ADMIN") {
    throw new Error("Forbidden – admin access required");
  }

  // 3. Prevent self-deletion
  if (session.user.id === teacherId) {
    throw new Error("You cannot delete your own account");
  }

  try {
    // 4. Check if teacher exists and is actually a TEACHER
    const teacher = await prisma.user.findUnique({
      where: { id: teacherId },
      select: { id: true, name: true, email: true, role: true },
    });

    if (!teacher) {
      throw new Error("Teacher not found");
    }

    if (teacher.role !== "TEACHER") {
      throw new Error("This user is not a teacher");
    }

    // 5. Prevent deleting if assigned to any classes
    const classCount = await prisma.class.count({
      where: { teacherId },
    });

    if (classCount > 0) {
      throw new Error(
        `Cannot delete "${teacher.name || teacher.email}" — ` +
        `they are assigned to ${classCount} class(es). Reassign classes first.`
      );
    }

    // 6. Atomic delete + audit log
    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // Audit log entry
      await tx.auditLog.create({
        data: {
          userId: session.user.id,
          action: "DELETE_TEACHER",
          entity: "User",
          entityId: teacherId,
          metadata: {
            email: teacher.email,
            name: teacher.name || null,
            role: "TEACHER",
            deletedBy: session.user.role,
          },
        },
      });

      // Delete the teacher (user)
      await tx.user.delete({
        where: { id: teacherId },
      });
    });

    return {
      success: true,
      message: `Teacher "${teacher.name || teacher.email}" deleted successfully`,
    };
  } catch (error: any) {
    console.error("Delete teacher error:", error);
    throw new Error(error.message || "Failed to delete teacher. Please try again.");
  }
}