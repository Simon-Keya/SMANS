"use server";

import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import { z } from "zod";

const promoteStudentsSchema = z.object({
  classId: z.string().min(1, "Current class ID is required"),
  nextClassId: z.string().min(1, "Next class ID is required"),
  promotionDate: z.coerce.date().optional().default(new Date()),
  remarks: z.string().optional(),
});

export async function promoteStudents(input: unknown) {
  const user = await getCurrentUser();

  if (!user || !["ADMIN", "TEACHER"].includes(user.role)) {
    throw new Error("Unauthorized: Only admins and teachers can promote students");
  }

  const validated = promoteStudentsSchema.safeParse(input);
  if (!validated.success) {
    throw new Error(validated.error.issues[0]?.message || "Invalid input");
  }

  const { classId, nextClassId, promotionDate, remarks } = validated.data;

  try {
    const [currentClass, nextClass] = await Promise.all([
      prisma.class.findUnique({
        where: { id: classId },
        select: { name: true },
      }),
      prisma.class.findUnique({
        where: { id: nextClassId },
        select: { name: true },
      }),
    ]);

    if (!currentClass || !nextClass) {
      throw new Error("One or both classes not found");
    }

    const students = await prisma.student.findMany({
      where: { classId },
      select: { id: true, name: true, admissionNumber: true },
    });

    if (students.length === 0) {
      throw new Error("No students found in the current class");
    }

    const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // Update students to new class (removed promotionDate since it doesn't exist in schema)
      await tx.student.updateMany({
        where: { classId },
        data: {
          classId: nextClassId,
          // promotionDate field doesn't exist in your Student model
        },
      });

      // Create promotion logs using the correct schema fields
      await tx.promotionLog.createMany({
        data: students.map((student) => ({
          studentId: student.id,
          fromClass: currentClass.name,  // Using fromClass (String) not fromClassId
          toClass: nextClass.name,        // Using toClass (String) not toClassId
          date: promotionDate,            // Using 'date' field from your schema
          approvedBy: user.id,            // Using 'approvedBy' field from your schema
        })),
      });

      // Create audit log for the batch action
      await tx.auditLog.create({
        data: {
          userId: user.id,
          action: "PROMOTE_STUDENTS",
          entity: "Class",
          entityId: classId,
          metadata: {
            studentCount: students.length,
            fromClass: currentClass.name,
            toClass: nextClass.name,
            promotionDate: promotionDate.toISOString(),
            remarks: remarks || null,
          },
        },
      });

      return { count: students.length };
    });

    return {
      success: true,
      message: `${students.length} students successfully promoted from ${currentClass.name} to ${nextClass.name}`,
      count: students.length,
      fromClass: currentClass.name,
      toClass: nextClass.name,
    };
  } catch (error: any) {
    console.error("Promote students error:", error);
    throw new Error(error.message || "Failed to promote students. Please try again.");
  }
}