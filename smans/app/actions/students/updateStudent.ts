"use server";

import { authOptions } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";

export async function updateStudent(
  studentId: string,
  data: Partial<{
    firstName: string;
    lastName: string;
    gender: "male" | "female";
    dateOfBirth: Date;
  }>
) {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("Unauthorized");

  return prisma.student.update({
    where: { id: studentId },
    data,
  });
}
