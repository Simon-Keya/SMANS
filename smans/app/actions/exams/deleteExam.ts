// app/actions/exams/deleteExam.ts
"use server";

import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export async function deleteExam(examId: string) {
  const user = await getCurrentUser();

  // Only ADMIN and TEACHER can delete exams
  if (!user || !["ADMIN", "TEACHER"].includes(user.role)) {
    throw new Error("Unauthorized: Only admins and teachers can delete exams");
  }

  if (!examId || typeof examId !== "string") {
    throw new Error("Invalid exam ID");
  }

  try {
    // Check if exam exists
    const exam = await prisma.exam.findUnique({
      where: { id: examId },
      select: { id: true, name: true },
    });

    if (!exam) {
      throw new Error("Exam not found");
    }

    // Safety: check if grades are linked to this exam
    const relatedGradesCount = await prisma.grade.count({
      where: { examId },
    });

    if (relatedGradesCount > 0) {
      throw new Error(
        `Cannot delete exam "${exam.name}" — it has ${relatedGradesCount} grade records. ` +
        `Delete or reassign the grades first.`
      );
    }

    // Atomic transaction: delete + audit log
    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      await tx.auditLog.create({
        data: {
          userId: user.id,
          action: "DELETE_EXAM",
          entity: "Exam",
          entityId: examId,
          metadata: { name: exam.name },
        },
      });

      await tx.exam.delete({
        where: { id: examId },
      });
    });

    return {
      success: true,
      message: `Exam "${exam.name}" deleted successfully`,
    };
  } catch (error: any) {
    console.error("Delete exam error:", error);
    throw new Error(error.message || "Failed to delete exam. Please try again.");
  }
}