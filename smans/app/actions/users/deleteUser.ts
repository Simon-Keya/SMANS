"use server";

import { authOptions } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";

export async function deleteUser(userId: string) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    throw new Error("Unauthorized – please log in");
  }

  if (session.user.role !== "ADMIN") {
    throw new Error("Forbidden – admin access required");
  }

  if (session.user.id === userId) {
    throw new Error("You cannot delete your own account");
  }

  try {
    const userToDelete = await prisma.user.findUnique({
      where: { id: userId },
      select: { 
        id: true, 
        email: true, 
        name: true, 
        role: true,
        student: { select: { id: true } },
        parent: { select: { id: true } },
      },
    });

    if (!userToDelete) {
      throw new Error("User not found");
    }

    // Role-specific safety checks
    if (userToDelete.role === "TEACHER") {
      const classCount = await prisma.class.count({ where: { teacherId: userId } });
      if (classCount > 0) {
        throw new Error(`Cannot delete teacher with ${classCount} active classes`);
      }
    }

    if (userToDelete.role === "STUDENT" && userToDelete.student) {
      const gradeCount = await prisma.grade.count({ where: { studentId: userToDelete.student.id } });
      if (gradeCount > 0) {
        throw new Error(`Cannot delete student with existing grades`);
      }
    }

    // Delete related records first (due to foreign key constraints)
    if (userToDelete.student) {
      await prisma.student.delete({ where: { id: userToDelete.student.id } });
    }
    
    if (userToDelete.parent) {
      await prisma.parent.delete({ where: { id: userToDelete.parent.id } });
    }

    // Delete the user
    await prisma.user.delete({ where: { id: userId } });

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "DELETE_USER",
        entity: "User",
        entityId: userId,
        metadata: {
          email: userToDelete.email,
          name: userToDelete.name || null,
          role: userToDelete.role,
        },
      },
    });

    return {
      success: true,
      message: `User ${userToDelete.email} (${userToDelete.role}) deleted`,
    };
  } catch (error: any) {
    console.error("Delete user error:", error);
    throw new Error(error.message || "Failed to delete user");
  }
}