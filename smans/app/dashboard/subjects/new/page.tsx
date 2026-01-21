import SubjectForm from "@/components/dashboard/subjects/SubjectForm";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export default async function NewSubjectPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "admin") {
    redirect("/dashboard");
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-primary">Create New Subject</h1>
      <SubjectForm />
    </div>
  );
}