// app/dashboard/teachers/[id]/edit/page.tsx
import TeacherForm from "@/components/teachers/TeacherForm";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";

interface EditTeacherPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditTeacherPage({ params }: EditTeacherPageProps) {
  const user = await getCurrentUser();

  if (!user || user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const { id } = await params;   // ← Critical fix

  let teacher = null;

  try {
    teacher = await prisma.user.findUnique({
      where: { 
        id,
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
    console.error("❌ Error loading teacher:", error);
  }

  if (!teacher) {
    notFound();
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
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