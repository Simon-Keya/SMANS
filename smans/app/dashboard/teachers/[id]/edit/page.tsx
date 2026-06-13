// app/dashboard/teachers/[id]/edit/page.tsx
import TeacherForm from "@/components/teachers/TeacherForm";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";

interface EditTeacherPageProps {
  params: { id: string };
}

export default async function EditTeacherPage({ params }: EditTeacherPageProps) {
  const user = await getCurrentUser();

  // Security check
  if (!user || user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  let teacher;

  try {
    teacher = await prisma.user.findUnique({
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
  } catch (error) {
    console.error("Error fetching teacher for edit:", error);
    throw new Error("Failed to load teacher data");
  }

  if (!teacher) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">
          Edit Teacher: {teacher.name ?? "Unnamed Teacher"}
        </h1>
        <p className="text-base-content/60 mt-1">Update teacher information below</p>
      </div>

      <TeacherForm teacher={teacher} />
    </div>
  );
}