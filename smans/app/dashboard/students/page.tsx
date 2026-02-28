// app/dashboard/students/page.tsx
import { Button } from "@/components/ui/Button";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import StudentsClient from "./students-client";

export default async function StudentsPage() {
  // Fetch students with relations (class name + parent phone)
  const rawStudents = await prisma.student.findMany({
    orderBy: { rollNumber: "asc" },
    include: {
      class: {
        select: { name: true }, // only need class name
      },
      parent: {
        select: { phone: true }, // parent's phone
      },
    },
  });

  // Map to a clean shape for the client component
  const students = rawStudents.map((s) => ({
    id: s.id,
    name: s.name,
    rollNumber: s.rollNumber,
    className: s.class?.name || "Not assigned", // ← use class name
    email: s.email ?? undefined,
    studentPhone: s.phone ?? undefined,
    parentPhone: s.parent?.phone ?? undefined, // ← parent's phone
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