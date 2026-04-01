// app/dashboard/assessments/[id]/edit/page.tsx
import AssessmentForm from "@/components/exams/AssessmentForm";
import { Button } from "@/components/ui/Button";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
export default async function EditAssessmentPage({ params }: { params: { id: string } }) {
  const user = await getCurrentUser();

  if (!user || !["ADMIN", "TEACHER"].includes(user.role)) {
    redirect("/dashboard");
  }

  const assessment = await prisma.assessment.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      title: true,
      learningAreaId: true,
      classId: true,
      date: true,
      duration: true,
      maxScore: true,
      assessmentType: true,
    },
  });

  if (!assessment) notFound();

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-primary">Edit Assessment</h1>
        <Button variant="outline" asChild>
          <Link href="/dashboard/assessments">Back to Assessments</Link>
        </Button>
      </div>

      <AssessmentForm assessment={assessment} />
    </div>
  );
}