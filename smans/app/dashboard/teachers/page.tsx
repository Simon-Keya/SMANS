// app/dashboard/teachers/page.tsx
import { Button } from "@/components/ui/Button";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { Plus } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import TeacherTable from "@/components/teachers/TeacherTable";

type Teacher = {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  staffNo: string | null;
  role: string;
  createdAt: Date;
};

export default async function TeachersPage() {
  const user = await getCurrentUser();

  if (!user || user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  let teachers: Teacher[] = [];

  try {
    teachers = await prisma.user.findMany({
      where: { role: "TEACHER" },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        staffNo: true,
        role: true,
        createdAt: true,
      },
    });
  } catch (error) {
    console.error("Failed to fetch teachers:", error);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Manage Teachers</h1>
          <p className="text-base-content/60">
            {teachers.length} teacher{teachers.length !== 1 ? "s" : ""} found
          </p>
        </div>

        <Button asChild>
          <Link href="/dashboard/teachers/new" className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add New Teacher
          </Link>
        </Button>
      </div>

      <TeacherTable teachers={teachers} />
    </div>
  );
}