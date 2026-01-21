import ExamTable from "@/components/exams/ExamTable";
import { Button } from "@/components/ui/Button";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Plus } from "lucide-react";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function ExamsPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/login");
  }

  const exams = await prisma.exam.findMany({
    select: {
      id: true,
      title: true,
      subject: { select: { name: true } },
      class: { select: { name: true } },
      date: true,
      status: true,
    },
    orderBy: { date: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-primary">Exams & Assessments</h1>
        {(session.user.role === "admin" || session.user.role === "teacher") && (
          <Button asChild className="btn-primary gap-2">
            <Link href="/dashboard/exams/new">
              <Plus className="h-4 w-4" />
              Schedule Exam
            </Link>
          </Button>
        )}
      </div>

      {exams.length === 0 ? (
        <div className="text-center py-12 text-base-content/60 bg-base-200 rounded-lg">
          No exams scheduled yet.
        </div>
      ) : (
        <ExamTable exams={exams} />
      )}
    </div>
  );
}