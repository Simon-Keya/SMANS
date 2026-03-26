// app/actions/subjects/deleteSubject.ts
"use server";

import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

export async function deleteSubject(subjectId: string) {
  const user = await getCurrentUser();

  if (!user || !["ADMIN", "ACCOUNTANT"].includes(user.role)) {
    throw new Error("Unauthorized: Only admins and accountants can delete subjects");
  }

  if (!subjectId || typeof subjectId !== "string") {
    throw new Error("Invalid subject ID");
  }

  try {
    // Check if subject exists
    const subject = await prisma.subject.findUnique({
      where: { id: subjectId },
      select: { id: true, name: true, code: true },
    });

    if (!subject) {
      throw new Error("Subject not found");
    }

    // Safety: check if subject is used in any class or grades
    const usageCount = await prisma.$transaction([
      prisma.class.count({ where: { subjects: { some: { id: subjectId } } } }),
      prisma.grade.count({ where: { subjectId } }),
    ]);

    if (usageCount[0] > 0 || usageCount[1] > 0) {
      throw new Error(
        `Cannot delete subject "${subject.name}" — it is currently used in classes or grades.`
      );
    }

    // Atomic delete + audit log
    await prisma.$transaction(async (tx) => {
      await tx.auditLog.create({
        data: {
          userId: user.id,
          action: "DELETE_SUBJECT",
          entity: "Subject",
          entityId: subjectId,
          metadata: { name: subject.name, code: subject.code },
        },
      });

      await tx.subject.delete({
        where: { id: subjectId },
      });
    });

    return {
      success: true,
      message: `Subject "${subject.name}" deleted successfully`,
    };
  } catch (error: any) {
    console.error("Delete subject error:", error);
    throw new Error(error.message || "Failed to delete subject. Please try again.");
  }
}