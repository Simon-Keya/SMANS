// app/dashboard/students/new/page.tsx
import StudentForm from "@/components/students/StudentForm";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function NewStudentPage() {
  const user = await getCurrentUser();

  if (!user || user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  // Fetch classes and parents for dropdowns
  const [classes, parents] = await Promise.all([
    prisma.class.findMany({
      select: { id: true, name: true, level: true },
      orderBy: { name: "asc" },
    }),
    prisma.parent.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Add New Student</h1>
        <p className="text-base-content/60">Create a new student record</p>
      </div>

      <StudentForm 
        classes={classes}
        parents={parents}
      />
    </div>
  );
}