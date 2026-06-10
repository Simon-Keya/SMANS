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
          name: true, // Get the class name as a string
        },
      },
      parent: {
        select: {
          name: true,
          phone: true,
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
    class: student.class?.name || "Not Assigned", // Extract class name as string
    email: student.email,
    phone: student.phone,
    parentName: student.parent?.name,
    parentPhone: student.parent?.phone,
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