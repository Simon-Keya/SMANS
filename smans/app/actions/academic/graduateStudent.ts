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

    // Get students in the class - FIXED: 'rollNumber' doesn't exist, use 'admissionNumber' instead
    const students = await prisma.student.findMany({
      where: { classId },
      select: { id: true, name: true, admissionNumber: true }, // Changed from rollNumber to admissionNumber
    });

    if (students.length === 0) {
      throw new Error("No students found in this class");
    }

    // Perform graduation in a transaction
    const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // 1. Update student status to graduated
      const updatedStudents = await tx.student.updateMany({
        where: { classId },
        data: {
          status: "GRADUATED",
          graduationDate,
          currentClassId: null, // remove from current class
        },
      });

      // 2. Create graduation logs - FIXED: Check if graduationLog model exists, or use auditLog instead
      // If you have a GraduationLog model, uncomment the following:
      /*
      await tx.graduationLog.createMany({
        data: students.map((student: { id: string; name: string | null; admissionNumber: string | null }) => ({
          studentId: student.id,
          fromClassId: classId,
          graduationDate,
          remarks: remarks || `Graduated from ${classExists.name}`,
          graduatedById: user.id,
        })),
      });
      */

      // Alternative: Create individual audit logs for each student
      await Promise.all(students.map((student: { id: string; name: string | null; admissionNumber: string | null }) => 
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
              className: classExists.name,
              graduationDate: graduationDate.toISOString(),
              remarks: remarks || `Graduated from ${classExists.name}`,
            },
          },
        })
      ));

      // 3. Audit log for the batch action
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