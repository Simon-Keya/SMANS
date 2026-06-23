// app/dashboard/students/[id]/edit/page.tsx
import StudentForm from "@/components/students/StudentForm";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";

interface EditStudentPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditStudentPage({ params }: EditStudentPageProps) {
  const user = await getCurrentUser();

  if (!user || user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const { id } = await params;

  // Fetch all data in parallel
  const [student, classes, parents] = await Promise.all([
    prisma.student.findUnique({
      where: { id },
      include: {
        class: { select: { id: true, name: true } },
        parent: { select: { id: true, name: true } },
      },
    }),
    prisma.class.findMany({
      select: { id: true, name: true, level: true },
      orderBy: { name: "asc" },
    }),
    prisma.parent.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  if (!student) notFound();

  // Check if student is unassigned to show a helpful note
  const isUnassigned = !student.classId;

  return (
    <div className="max-w-3xl mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Edit Student</h1>
        <p className="text-muted-foreground mt-2">Update {student.name}'s information</p>
        {isUnassigned && (
          <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 text-yellow-700 rounded-lg text-sm">
            ⚠️ This student hasn't been assigned to a class yet. Please select a class below.
          </div>
        )}
      </div>

      <StudentForm 
        defaultValues={{
          name: student.name,
          admissionNumber: student.admissionNumber,
          email: student.email || "",
          phone: student.phone || "",
          classId: student.classId || "", // Empty string if unassigned
          parentId: student.parentId || "",
          password: "",
        }}
        isEdit={true}
        studentId={id}
        classes={classes}
        parents={parents}
      />
    </div>
  );
}