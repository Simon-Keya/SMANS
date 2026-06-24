// app/dashboard/assessments/new/page.tsx
import AssessmentForm from "@/components/exams/AssessmentForm";
import { Button } from "@/components/ui/Button";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/session";
import { redirect } from "next/navigation";

export default async function NewAssessmentPage() {
  const user = await getCurrentUser();

  // ✅ Only ADMIN and TEACHER can create assessments
  if (!user || !["ADMIN", "TEACHER"].includes(user.role)) {
    redirect("/dashboard");
  }

  // Fetch learning areas for the form dropdown
  const learningAreas = await prisma.learningArea.findMany({
    select: {
      id: true,
      name: true,
      code: true,
    },
    orderBy: { name: "asc" },
  });

  // Fetch classes for the form dropdown
  const classes = await prisma.class.findMany({
    select: {
      id: true,
      name: true,
      level: true,
    },
    orderBy: [{ level: "asc" }, { name: "asc" }],
  });

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-primary">Schedule New Assessment</h1>
        <Button variant="outline" asChild>
          <Link href="/dashboard/assessments">Back to Assessments</Link>
        </Button>
      </div>

      <AssessmentForm 
        learningAreas={learningAreas}
        classes={classes}
      />
    </div>
  );
}