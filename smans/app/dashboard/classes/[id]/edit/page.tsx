// app/dashboard/classes/[id]/edit/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ClassForm from "@/components/classes/ClassForm";
import { notFound } from "next/navigation";

interface EditClassPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditClassPage({ params }: EditClassPageProps) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const { id } = await params;

  // Fetch the class
  const classData = await prisma.class.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      level: true,
      teacherId: true,
    },
  });

  if (!classData) {
    notFound();
  }

  // Fetch teachers
  const teachers = await prisma.user.findMany({
    where: { role: "TEACHER", isActive: true },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <h1 className="text-3xl font-bold text-primary">Edit Class</h1>
        <span className="text-base-content/60">— {classData.name}</span>
      </div>

      <ClassForm 
        classData={classData} 
        teachers={teachers} 
      />
    </div>
  );
}