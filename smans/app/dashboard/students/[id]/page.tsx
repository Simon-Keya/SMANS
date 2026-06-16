// app/dashboard/students/[id]/page.tsx
import StudentCard from "@/components/students/StudentCard";
import { Button } from "@/components/ui/Button";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";

interface StudentDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function StudentDetailPage({ params }: StudentDetailPageProps) {
  const { id } = await params;
  
  const student = await prisma.student.findUnique({
    where: { id },
    include: {
      class: {
        select: {
          name: true,
        },
      },
      parent: {
        select: {
          name: true,
          phone: true,
          email: true,
        },
      },
      user: {
        select: {
          email: true,
        },
      },
    },
  });

  if (!student) {
    notFound();
  }

  // Transform to match StudentCard expected shape
  const normalizedStudent = {
    id: student.id,
    name: student.name,
    admissionNumber: student.admissionNumber,
    class: student.class?.name || "Not Assigned",
    email: student.email || student.user?.email || undefined,
    phone: student.phone || undefined,
    parentName: student.parent?.name || undefined,
    parentPhone: student.parent?.phone || undefined,
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Student Detail</h1>
        <Button asChild>
          <Link href={`/dashboard/students/${id}/edit`}>Edit</Link>
        </Button>
      </div>
      <StudentCard student={normalizedStudent} />
    </div>
  );
}