// app/dashboard/classes/[id]/edit/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ClassForm from "@/components/classes/ClassForm";

interface EditClassPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditClassPage({ params }: EditClassPageProps) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const { id } = await params;

  const [classData, teachers] = await Promise.all([
    prisma.class.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        level: true,
        teacherId: true,
      },
    }),
    prisma.user.findMany({
      where: { role: "TEACHER", isActive: true },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  if (!classData) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-primary">Edit Class</h1>
      <ClassForm classData={classData} teachers={teachers} />
    </div>
  );
}