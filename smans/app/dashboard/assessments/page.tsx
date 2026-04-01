// app/dashboard/assessments/page.tsx
import AssessmentTable from "@/components/exams/AssessmentTable";
import { Button } from "@/components/ui/Button";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { Plus } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function AssessmentsPage() {
  const user = await getCurrentUser();

  if (!user || !["ADMIN", "TEACHER"].includes(user.role)) {
    redirect("/dashboard");
  }

  const assessments = await prisma.assessment.findMany({
    include: {
      learningArea: { select: { name: true } },
      class: { select: { name: true } },
    },
    orderBy: { date: "desc" },
  });

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary">Assessments</h1>
          <p className="text-muted-foreground">Manage CBC assessments and progress checks</p>
        </div>

        <Button asChild>
          <Link href="/dashboard/assessments/new">
            <Plus className="mr-2 h-4 w-4" />
            New Assessment
          </Link>
        </Button>
      </div>

      <AssessmentTable 
        assessments={assessments} 
        onDelete={async (id: string) => {
          "use server";
          // You can call your deleteAssessment action here
          console.log("Delete assessment:", id);
        }} 
      />
    </div>
  );
}