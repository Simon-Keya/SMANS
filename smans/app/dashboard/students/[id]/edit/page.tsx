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

  const student = await prisma.student.findUnique({
    where: { id },
    include: {
      class: { select: { id: true, name: true } },
      parent: { select: { id: true, name: true } },
    },
  });

  if (!student) notFound();

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Edit Student</h1>
        <p className="text-base-content/60">Update {student.name}'s information</p>
      </div>

      <StudentForm 
        defaultValues={{
          name: student.name,
          admissionNumber: student.admissionNumber,
          email: student.email || "",
          phone: student.phone || "",
          classId: student.classId,
          parentId: student.parentId || "",
        }}
        isEdit={true}
        studentId={id}
      />
    </div>
  );
}