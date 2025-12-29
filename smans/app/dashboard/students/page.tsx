import StudentTable from "@/components/students/StudentTable";
import { Button } from "@/components/ui/Button";
import { prisma } from "@/lib/prisma"; // Adjust to your Prisma client path
import Link from "next/link";

export default async function StudentsPage() {
  const students = await prisma.student.findMany({
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
        onEdit={(student) => {} /* Client-side navigation handled by Link */}
        onDelete={async (id) => {
          "use server";
          await prisma.student.delete({ where: { id } });
        }}
      />
    </div>
  );
}