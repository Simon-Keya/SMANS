import StudentCard from "@/components/students/StudentCard";
import { Button } from "@/components/ui/Button";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation"; // ← Fixed import

export default async function StudentDetailPage({ params }: { params: { id: string } }) {
  const student = await prisma.student.findUnique({
    where: { id: params.id },
  });

  if (!student) {
    notFound(); // Now works correctly
  }

  // Normalize null → undefined to match StudentCard props
  const normalizedStudent = {
    ...student,
    email: student.email ?? undefined,
    phone: student.phone ?? undefined,
    parentName: student.parentName ?? undefined,
    parentPhone: student.parentPhone ?? undefined,
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Student Detail</h1>
        <Button asChild>
          <Link href={`/dashboard/students/${params.id}/edit`}>Edit</Link>
        </Button>
      </div>
      <StudentCard student={normalizedStudent} />
    </div>
  );
}