import StudentForm from "@/components/students/StudentForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

async function createStudent(data: any) {
  "use server";
  await prisma.student.create({ data });
  redirect("/dashboard/students");
}

export default function NewStudentPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Add New Student</CardTitle>
        </CardHeader>
        <CardContent>
          <StudentForm onSubmit={createStudent} />
        </CardContent>
      </Card>
    </div>
  );
}