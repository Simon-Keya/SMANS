import StudentForm from "@/components/students/StudentForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";

async function updateStudent(id: string, data: any) {
  "use server";
  await prisma.student.update({ where: { id }, data });
  redirect(`/dashboard/students/${id}`);
}

export default async function EditStudentPage({ params }: { params: { id: string } }) {
  const student = await prisma.student.findUnique({ where: { id: params.id } });

  if (!student) notFound();

  // Normalize Prisma's null values to undefined to match form expectations
  const normalizedStudent = {
    name: student.name,
    rollNumber: student.rollNumber,
    class: student.class,
    email: student.email ?? undefined,
    phone: student.phone ?? undefined,
    parentName: student.parentName ?? undefined,
    parentPhone: student.parentPhone ?? undefined,
    // Exclude id, createdAt, updatedAt — not needed in the form
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Edit Student</CardTitle>
        </CardHeader>
        <CardContent>
          <StudentForm
            defaultValues={normalizedStudent}
            onSubmit={(data) => updateStudent(params.id, data)}
          />
        </CardContent>
      </Card>
    </div>
  );
}