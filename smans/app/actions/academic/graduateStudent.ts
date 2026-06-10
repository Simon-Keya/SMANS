// app/actions/students/graduateStudents.ts
"use server";

import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import { z } from "zod";

const graduateStudentsSchema = z.object({
  classId: z.string().min(1, "Class ID is required"),
  graduationDate: z.coerce.date().optional().default(new Date()),
  remarks: z.string().optional(),
});

export async function graduateStudents(input: unknown) {
  const user = await getCurrentUser();

  if (!user || !["ADMIN", "TEACHER"].includes(user.role)) {
    throw new Error("Unauthorized: Only admins and teachers can graduate students");
  }

  const validated = graduateStudentsSchema.safeParse(input);
  if (!validated.success) {
    throw new Error(validated.error.issues[0]?.message || "Invalid input");
  }

  const { classId, graduationDate, remarks } = validated.data;

  try {
    // Check if class exists
    const classExists = await prisma.class.findUnique({
      where: { id: classId },
      select: { name: true },
    });

    if (!classExists) {
      throw new Error("Class not found");
    }

    // Get students in the class
    const students = await prisma.student.findMany({
      where: { classId },
      select: { id: true, name: true, admissionNumber: true },
    });

    if (students.length === 0) {
      throw new Error("No students found in this class");
    }

    // Perform graduation in a transaction
    const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // 1. Move students to a new "Graduated" class or remove from current class
      // Since there's no status field, we'll either:
      // Option A: Move to a special "Graduated" class (recommended)
      // First, find or create a "Graduated" class
      let graduatedClass = await tx.class.findFirst({
        where: { name: "GRADUATED", level: "N/A" },
      });

      if (!graduatedClass) {
        graduatedClass = await tx.class.create({
          data: {
            name: "GRADUATED",
            level: "N/A",
          },
        });
      }

      // Move all students to the graduated class
      const updatedStudents = await tx.student.updateMany({
        where: { classId },
        data: {
          classId: graduatedClass.id,
        },
      });

      // 2. Create promotion logs for each student
      await Promise.all(students.map((student) =>
        tx.promotionLog.create({
          data: {
            studentId: student.id,
            fromClass: classExists.name,
            toClass: "GRADUATED",
            date: graduationDate,
            approvedBy: user.id,
          },
        })
      ));

      // 3. Create audit logs for each student
      await Promise.all(students.map((student) =>
        tx.auditLog.create({
          data: {
            userId: user.id,
            action: "GRADUATE_STUDENT",
            entity: "Student",
            entityId: student.id,
            metadata: {
              studentName: student.name,
              admissionNumber: student.admissionNumber,
              fromClassId: classId,
              fromClassName: classExists.name,
              graduationDate: graduationDate.toISOString(),
              remarks: remarks || `Graduated from ${classExists.name}`,
            },
          },
        })
      ));

      // 4. Audit log for the batch action
      await tx.auditLog.create({
        data: {
          userId: user.id,
          action: "GRADUATE_STUDENTS_BATCH",
          entity: "Class",
          entityId: classId,
          metadata: {
            studentCount: students.length,
            className: classExists.name,
            graduationDate: graduationDate.toISOString(),
            remarks: remarks || null,
          },
        },
      });

      return updatedStudents;
    });

    return {
      success: true,
      message: `${students.length} students successfully graduated from ${classExists.name}`,
      count: students.length,
      graduationDate,
    };
  } catch (error: any) {
    console.error("Graduate students error:", error);
    throw new Error(error.message || "Failed to graduate students. Please try again.");
  }
}