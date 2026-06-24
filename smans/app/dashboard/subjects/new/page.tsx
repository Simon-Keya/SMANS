// app/dashboard/subjects/new/page.tsx
import SubjectForm from "@/components/subjects/SubjectForm";
import { authOptions } from "@/lib/auth/auth";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/permissions";

export default async function NewSubjectPage() {
  const session = await getServerSession(authOptions);

  // ✅ Only ADMIN can create subjects
  if (!session || session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-primary">Create New Subject</h1>
      <SubjectForm />
    </div>
  );
}