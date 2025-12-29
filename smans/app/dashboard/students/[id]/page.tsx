import StudentCard from "@/components/students/StudentCard";
import { Button } from "@/components/ui/Button";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/not-found";

export default async function StudentDetailPage({ params }: { params: { id: string } }) {
  const student = await prisma.student.findUnique({
    where: { id: params.id },
  });

  if (!student) notFound();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Student Detail</h1>
        <Button asChild>
          <Link href={`/dashboard/students/${params.id}/edit`}>Edit</Link>
        </Button>
      </div>
      <StudentCard student={student} />
    </div>
  );
}