// app/dashboard/students/new/page.tsx.
import StudentForm from "@/components/students/StudentForm";
import { getCurrentUser } from "@/lib/auth/session";
import { redirect } from "next/navigation";

export default async function NewStudentPage() {
  const user = await getCurrentUser();

  if (!user || user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  return (
    <div className="max-w-3xl mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Add New Student</h1>
        <p className="text-muted-foreground mt-2">
          Create a new student record with class and parent information.
        </p>
      </div>

      <StudentForm />
    </div>
  );
}