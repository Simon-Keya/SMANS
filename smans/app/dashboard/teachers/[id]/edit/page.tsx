// app/dashboard/teachers/[id]/edit/page.tsx
import TeacherForm from "@/components/teachers/TeacherForm";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { notFound, redirect } from "next/navigation";

interface EditTeacherPageProps {
  params: { id: string };
}

export default async function EditTeacherPage({ params }: EditTeacherPageProps) {
  const user = await getCurrentUser();

  if (!user || user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const teacher = await prisma.user.findUnique({
    where: { 
      id: params.id,
      role: "TEACHER" 
    },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      staffNo: true,
    },
  });

  if (!teacher) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">
          Edit Teacher: {teacher.name ?? "Unnamed Teacher"}
        </h1>
        <p className="text-base-content/60">Update teacher information</p>
      </div>

      <TeacherForm teacher={teacher} />
    </div>
  );
}