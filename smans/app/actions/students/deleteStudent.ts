// app/actions/students/deleteStudent.ts
"use server";

import { authOptions } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";

export async function deleteStudent(studentId: string): Promise<boolean> {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized - admin only");
  }

  try {
    // Check if student exists and has related records
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: {
        grades: { select: { id: true } },
        attendance: { select: { id: true } },
        invoices: { select: { id: true } },
      },
    });

    if (!student) {
      throw new Error("Student not found");
    }

    // Prevent deletion if student has grades
    if (student.grades.length > 0) {
      throw new Error(`Cannot delete student with ${student.grades.length} grade(s) recorded.`);
    }

    // Prevent deletion if student has attendance records
    if (student.attendance.length > 0) {
      throw new Error(`Cannot delete student with ${student.attendance.length} attendance record(s).`);
    }

    // Prevent deletion if student has invoices
    if (student.invoices.length > 0) {
      throw new Error(`Cannot delete student with ${student.invoices.length} invoice(s) recorded.`);
    }

    // Delete the student
    await prisma.student.delete({
      where: { id: studentId },
    });

    revalidatePath("/dashboard/students");

    return true;
  } catch (error) {
    console.error("[DELETE_STUDENT_ERROR]", error);
    throw error;
  }
}