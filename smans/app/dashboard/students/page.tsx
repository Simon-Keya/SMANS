import { Button } from "@/components/ui/Button";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import StudentsClient from "./students-client";

export default async function StudentsPage() {
  const rawStudents = await prisma.student.findMany({
    orderBy: { rollNumber: "asc" },
  });

  const students = rawStudents.map((s) => ({
    id: s.id,
    name: s.name,
    rollNumber: s.rollNumber,
    class: s.class,
    email: s.email ?? undefined,
    parentPhone: s.parentPhone ?? undefined,
  }));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Students</h1>
        <Button asChild>
          <Link href="/dashboard/students/new">Add New Student</Link>
        </Button>
      </div>

      <StudentsClient students={students} />
    </div>
  );
}
