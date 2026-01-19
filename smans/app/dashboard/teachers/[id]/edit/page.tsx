import TeacherForm from "@/components/teachers/TeacherForm";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { notFound, redirect } from "next/navigation";

interface EditTeacherPageProps {
  params: { id: string };
}

export default async function EditTeacherPage({ params }: EditTeacherPageProps) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "admin") {
    redirect("/dashboard");
  }

  const teacher = await prisma.user.findUnique({
    where: { id: params.id, role: "teacher" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
  });

  if (!teacher) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Edit Teacher: {teacher.name}</h1>
      <TeacherForm teacher={teacher} />
    </div>
  );
}