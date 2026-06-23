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
    // Build update data with proper Prisma nested relations
    const updateData: any = {
      name: data.name,
      admissionNumber: data.admissionNumber,
      email: data.email,
      phone: data.phone,
    };

    // Handle class relation - use connect or disconnect
    if (data.classId !== undefined) {
      if (data.classId) {
        // Connect to existing class
        updateData.class = { connect: { id: data.classId } };
      } else {
        // Disconnect from current class
        updateData.class = { disconnect: true };
      }
    }

    // Handle parent relation - use connect or disconnect
    if (data.parentId !== undefined) {
      if (data.parentId) {
        // Connect to existing parent
        updateData.parent = { connect: { id: data.parentId } };
      } else {
        // Disconnect from current parent
        updateData.parent = { disconnect: true };
      }
    }

    console.log("📤 Prisma update data:", JSON.stringify(updateData, null, 2));

    const updatedStudent = await prisma.student.update({
      where: { id: studentId },
      data: updateData,
      include: { 
        class: { select: { id: true, name: true, level: true } },
        parent: { select: { id: true, name: true, phone: true, email: true } }
      },
    });

    revalidatePath("/dashboard/students");
    revalidatePath(`/dashboard/students/${studentId}`);

    return { success: true, data: updatedStudent };
  } catch (error: any) {
    console.error("Update student error:", error);
    
    if (error.code === "P2025") {
      return { success: false, error: "Student not found" };
    }
    if (error.code === "P2002") {
      return { success: false, error: "Admission number already exists" };
    }
    if (error.code === "P2003") {
      return { success: false, error: "Invalid class or parent ID provided" };
    }

    return { success: false, error: error.message || "Failed to update student" };
  }
}