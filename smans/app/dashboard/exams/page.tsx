// app/dashboard/exams/page.tsx
import AssessmentTable from "@/components/exams/AssessmentTable";
import { Button } from "@/components/ui/Button";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { Plus } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

// Helper function to determine assessment status
function getAssessmentStatus(date: Date): "UPCOMING" | "COMPLETED" | "IN_PROGRESS" {
  const today = new Date();
  const assessmentDate = new Date(date);
  
  // Reset time part for accurate date comparison
  today.setHours(0, 0, 0, 0);
  assessmentDate.setHours(0, 0, 0, 0);
  
  if (assessmentDate > today) {
    return "UPCOMING";
  } else if (assessmentDate.getTime() === today.getTime()) {
    return "IN_PROGRESS";
  } else {
    return "COMPLETED";
  }
}

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

  // Add computed status field to each assessment
  const assessmentsWithStatus = assessments.map(assessment => ({
    ...assessment,
    status: getAssessmentStatus(assessment.date)
  }));

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

      {assessments.length === 0 ? (
        <div className="text-center py-12 text-base-content/60 bg-base-200 rounded-lg">
          No assessments scheduled yet.
        </div>
      ) : (
        <AssessmentTable 
          assessments={assessmentsWithStatus} 
          onDelete={async (id: string) => {
            "use server";
            // Call your delete action here later
            console.log("Deleting assessment:", id);
          }} 
        />
      )}
    </div>
  );
}