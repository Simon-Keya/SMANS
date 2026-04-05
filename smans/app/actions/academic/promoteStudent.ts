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
      select: { id: true, name: true, admissionNumber: true }, // ← Changed
    });

    if (students.length === 0) {
      throw new Error("No students found in the current class");
    }

    const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      await tx.student.updateMany({
        where: { classId },
        data: {
          classId: nextClassId,
          promotionDate,
        },
      });

      await tx.promotionLog.createMany({
        data: students.map((student: { id: string; name: string | null; admissionNumber: string | null }) => ({
          studentId: student.id,
          fromClassId: classId,
          toClassId: nextClassId,
          promotionDate,
          remarks: remarks || `Promoted from ${currentClass.name} to ${nextClass.name}`,
          promotedById: user.id,
        })),
      });

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