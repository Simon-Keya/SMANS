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

  if (!user || user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  let teacher = null;

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

    console.log("✅ Teacher loaded for edit:", teacher?.name);
  } catch (error) {
    console.error("❌ Database error loading teacher for edit:", error);
    
    return (
      <div className="p-12 text-center">
        <h2 className="text-2xl font-bold text-error mb-4">Unable to Load Teacher</h2>
        <p className="text-base-content/70">There was an error retrieving this teacher&apos;s data.</p>
        <p className="text-sm mt-6 text-base-content/50">Please check the server terminal for more details.</p>
      </div>
    );
  }

  if (!teacher) {
    notFound();
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            Edit Teacher: {teacher.name ?? "Unnamed Teacher"}
          </h1>
          <p className="text-base-content/60 mt-1">Update teacher information below</p>
        </div>
      </div>

      <TeacherForm teacher={teacher} />
    </div>
  );
}