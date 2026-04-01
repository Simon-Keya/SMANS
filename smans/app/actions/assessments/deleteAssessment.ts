// app/actions/assessments/deleteAssessment.ts
"use server";

import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export async function deleteAssessment(assessmentId: string) {
  const user = await getCurrentUser();

  if (!user || !["ADMIN", "TEACHER"].includes(user.role)) {
    throw new Error("Unauthorized: Only admins and teachers can delete assessments");
  }

  // Check if assessment exists
  const assessment = await prisma.assessment.findUnique({
    where: { id: assessmentId },
    select: { id: true, title: true },
  });

  if (!assessment) {
    throw new Error("Assessment not found");
  }

  await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    // Audit log
    await tx.auditLog.create({
      data: {
        userId: user.id,
        action: "DELETE_ASSESSMENT",
        entity: "Assessment",
        entityId: assessmentId,
        metadata: { title: assessment.title, deletedBy: user.role },
      },
    });

    // Delete assessment
    await tx.assessment.delete({
      where: { id: assessmentId },
    });
  });

  return { 
    success: true, 
    message: `Assessment "${assessment.title}" deleted successfully` 
  };
}