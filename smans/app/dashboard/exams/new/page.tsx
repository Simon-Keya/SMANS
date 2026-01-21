import ExamForm from "@/components/exams/ExamForm";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export default async function NewExamPage() {
  const session = await getServerSession(authOptions);

  if (!session || (session.user.role !== "admin" && session.user.role !== "teacher")) {
    redirect("/dashboard");
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-primary">Schedule New Exam</h1>
      <ExamForm />
    </div>
  );
}