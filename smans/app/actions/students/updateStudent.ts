// app/actions/students/updateStudent.ts
"use server";

import { authOptions } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";

export async function updateStudent(studentId: string, data: any) {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== "ADMIN") {
    return { success: false, error: "Unauthorized: Admin access required" };
  }

  try {
    const updateData: any = {
      name: data.name,
      admissionNumber: data.admissionNumber,
      email: data.email,
      phone: data.phone,
      classId: data.classId,
      parentId: data.parentId,
    };

    const updatedStudent = await prisma.student.update({
      where: { id: studentId },
      data: updateData,
      include: { class: true, parent: true },
    });

    revalidatePath("/dashboard/students");
    revalidatePath(`/dashboard/students/${studentId}`);

    return { success: true, data: updatedStudent };
  } catch (error: any) {
    console.error("Update student error:", error);
    
    if (error.code === "P2025") return { success: false, error: "Student not found" };
    if (error.code === "P2002") return { success: false, error: "Admission number already exists" };

    return { success: false, error: error.message || "Failed to update student" };
  }
}