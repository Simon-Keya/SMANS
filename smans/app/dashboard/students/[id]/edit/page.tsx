// app/dashboard/students/[id]/edit/page.tsx
import StudentForm from "@/components/students/StudentForm";
import { Button } from "@/components/ui/Button";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";

async function updateStudent(id: string, data: any) {
  "use server";

  await prisma.student.update({
    where: { id },
    data: {
      name: data.name,
      admissionNumber: data.admissionNumber,     // ← Changed
      email: data.email ?? null,
      phone: data.phone ?? null,
      classId: data.classId,
      parentId: data.parentId ?? null,
    },
  });

  redirect(`/dashboard/students/${id}`);
}

export default async function EditStudentPage({ params }: { params: { id: string } }) {
  const student = await prisma.student.findUnique({
    where: { id: params.id },
    include: {
      class: {
        select: { name: true },
      },
      parent: {
        select: { name: true, phone: true },
      },
    },
  });

  if (!student) notFound();

  const normalizedStudent = {
    name: student.name,
    admissionNumber: student.admissionNumber,    // ← Changed
    classId: student.classId,
    className: student.class?.name || "Not assigned",
    email: student.email ?? undefined,
    phone: student.phone ?? undefined,
    parentId: student.parentId ?? undefined,
    parentName: student.parent?.name ?? undefined,
    parentPhone: student.parent?.phone ?? undefined,
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