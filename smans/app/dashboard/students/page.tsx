// app/dashboard/students/page.tsx
import { Button } from "@/components/ui/Button";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import StudentsClient from "./students-client";
import { deleteStudent } from "@/app/actions/students/deleteStudent";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth/session";
import { redirect } from "next/navigation";

type NormalizedStudent = {
  id: string;
  name: string;
  admissionNumber: string;
  className: string;
  email?: string;
  studentPhone?: string;
  parentPhone?: string;
};

// Server action for delete
async function handleDelete(id: string): Promise<void> {
  "use server";
  
  try {
    const result = await deleteStudent(id);
    
    if (!result) {
      throw new Error("Failed to delete student");
    }
    
    revalidatePath("/dashboard/students");
  } catch (error: any) {
    console.error("Delete error:", error);
    throw new Error(error.message || "Failed to delete student");
  }
}

export default async function StudentsPage() {
  // Check if user is admin
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  // Fetch ALL students with their relations
  const rawStudents = await prisma.student.findMany({
    orderBy: { admissionNumber: "asc" },
    include: {
      class: {
        select: { name: true },
      },
      parent: {
        select: { phone: true, name: true },
      },
      user: {
        select: { email: true, name: true, phone: true },
      },
    },
  });

  console.log(`📊 Total students found: ${rawStudents.length}`);

  // Transform the data with proper null handling
  const students: NormalizedStudent[] = rawStudents.map((s) => ({
    id: s.id,
    name: s.name || s.user?.name || "Unnamed Student",
    admissionNumber: s.admissionNumber || `STU/${String(s.id).slice(-6)}`,
    className: s.class?.name || "Not assigned",
    email: s.email || s.user?.email || undefined,
    studentPhone: s.phone || s.user?.phone || undefined,
    parentPhone: s.parent?.phone || undefined,
  }));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-primary">Students</h1>
        <div className="flex gap-3">
          <span className="text-sm text-base-content/60 flex items-center">
            {students.length} student{students.length !== 1 ? 's' : ''}
          </span>
          <Button asChild>
            <Link href="/dashboard/students/new">Add New Student</Link>
          </Button>
        </div>
      </div>

      <StudentsClient students={students} onDelete={handleDelete} />
    </div>
  );
}