// app/dashboard/students/page.tsx
import { Button } from "@/components/ui/Button";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import StudentsClient from "./students-client";

type StudentWithRelations = {
  id: string;
  name: string;
  admissionNumber: string;
  email: string | null;
  phone: string | null;
  class: { name: string } | null;
  parent: { phone: string | null } | null;
};

type NormalizedStudent = {
  id: string;
  name: string;
  admissionNumber: string;
  className: string;
  email?: string;
  studentPhone?: string;
  parentPhone?: string;
};

export default async function StudentsPage() {
  // Fetch students with relations
  const rawStudents = await prisma.student.findMany({
    orderBy: { admissionNumber: "asc" },
    include: {
      class: {
        select: { name: true },
      },
      parent: {
        select: { phone: true },
      },
    },
  });

  // Transform the data with proper null handling
  const students: NormalizedStudent[] = rawStudents.map((s: StudentWithRelations) => ({
    id: s.id,
    name: s.name,
    admissionNumber: s.admissionNumber,
    className: s.class?.name || "Not assigned",
    email: s.email ?? undefined,
    studentPhone: s.phone ?? undefined,
    parentPhone: s.parent?.phone ?? undefined,
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