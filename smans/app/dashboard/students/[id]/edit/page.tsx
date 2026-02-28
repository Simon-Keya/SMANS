// app/dashboard/students/[id]/edit/page.tsx
import StudentForm from "@/components/students/StudentForm";
import { Button } from "@/components/ui/Button";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";

async function updateStudent(id: string, data: any) {
  "use server";

  // Make sure to map form data to actual Prisma fields
  await prisma.student.update({
    where: { id },
    data: {
      name: data.name,
      rollNumber: data.rollNumber,
      email: data.email ?? null,
      phone: data.phone ?? null,
      classId: data.classId,
      parentId: data.parentId ?? null,
    },
  });

  redirect(`/dashboard/students/${id}`);
}

export default async function EditStudentPage({ params }: { params: { id: string } }) {
  // Fetch student with related class name and parent details
  const student = await prisma.student.findUnique({
    where: { id: params.id },
    include: {
      class: {
        select: { name: true }, // only need class name
      },
      parent: {
        select: { name: true, phone: true }, // parent's name & phone
      },
    },
  });

  if (!student) notFound();

  // Normalize Prisma data to match your StudentForm defaultValues
  const normalizedStudent = {
    name: student.name,
    rollNumber: student.rollNumber,
    classId: student.classId,          // ← use classId for form select
    className: student.class?.name || "Not assigned", // optional display only
    email: student.email ?? undefined,
    phone: student.phone ?? undefined,
    parentId: student.parentId ?? undefined,
    parentName: student.parent?.name ?? undefined,   // ← from parent relation
    parentPhone: student.parent?.phone ?? undefined, // ← from parent relation
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Edit Student</h1>
        <Button variant="outline" asChild>
          <a href={`/dashboard/students/${params.id}`}>Back to Profile</a>
        </Button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="p-6">
          <StudentForm
            defaultValues={normalizedStudent}
            onSubmit={(data) => updateStudent(params.id, data)}
          />
        </div>
      </div>
    </div>
  );
}