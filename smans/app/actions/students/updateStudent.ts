// app/actions/students/updateStudent.ts
"use server";

import { authOptions } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import { getServerSession } from "next-auth";

export async function updateStudent(
  studentId: string,
  data: Prisma.StudentUpdateInput
) {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("Unauthorized");

  // Ensure admin can update
  if (session.user.role !== "ADMIN") {
    throw new Error("Only admins can update students");
  }

  return prisma.student.update({
    where: { id: studentId },
    data,
  });
}