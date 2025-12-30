import StudentTable from "@/components/students/StudentTable";
import { Button } from "@/components/ui/Button";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function StudentsPage() {
  const rawStudents = await prisma.student.findMany({
    select: {
      id: true,
      name: true,
      rollNumber: true,
      class: true,
      email: true,
      parentPhone: true,
    },
    orderBy: { rollNumber: "asc" },
  });

  // Normalize null → undefined for type compatibility
  const students = rawStudents.map((student) => ({
    id: student.id,
    name: student.name,
    rollNumber: student.rollNumber,
    class: student.class,
    email: student.email ?? undefined,
    parentPhone: student.parentPhone ?? undefined,
  }));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Students</h1>
        <Button asChild>
          <Link href="/dashboard/students/new">Add New Student</Link>
        </Button>
      </div>

      <StudentTable
        students={students}
        onEdit={(student) => {
          // Optional: You can log or handle if needed
          // Navigation is usually handled inside StudentTable via Link
        }}
        onDelete={async (id: string) => {
          "use server";
          // This is a valid Server Action when passed correctly
          await prisma.student.delete({ where: { id } });
          // Revalidate or refresh data (optional, Next.js will handle cache)
        }}
      />
    </div>
  );
}