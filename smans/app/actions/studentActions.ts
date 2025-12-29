"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createStudent(data: {
  name: string;
  rollNumber: string;
  class: string;
  email?: string;
  phone?: string;
  parentName?: string;
  parentPhone?: string;
}) {
  await prisma.student.create({
    data,
  });

  revalidatePath("/dashboard/students");
  redirect("/dashboard/students");
}

export async function updateStudent(id: string, data: {
  name: string;
  rollNumber: string;
  class: string;
  email?: string;
  phone?: string;
  parentName?: string;
  parentPhone?: string;
}) {
  await prisma.student.update({
    where: { id },
    data,
  });

  revalidatePath("/dashboard/students");
  revalidatePath(`/dashboard/students/${id}`);
  redirect(`/dashboard/students/${id}`);
}

export async function deleteStudent(id: string) {
  await prisma.student.delete({
    where: { id },
  });

  revalidatePath("/dashboard/students");
}