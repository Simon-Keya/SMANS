// app/dashboard/assessments/[id]/page.tsx
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

export default async function AssessmentDetailPage({ params }: { params: { id: string } }) {
  const user = await getCurrentUser();

  if (!user || !["ADMIN", "TEACHER"].includes(user.role)) {
    redirect("/dashboard");
  }

  const assessment = await prisma.assessment.findUnique({
    where: { id: params.id },
    include: {
      learningArea: true,
      class: true,
    },
  });

  if (!assessment) notFound();

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-primary">{assessment.title}</h1>
        <Button variant="outline" asChild>
          <Link href="/dashboard/assessments">Back to List</Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Assessment Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Learning Area</p>
              <p className="font-medium">{assessment.learningArea.name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Class</p>
              <p className="font-medium">{assessment.class.name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Date</p>
              <p className="font-medium">{new Date(assessment.date).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Duration</p>
              <p className="font-medium">{assessment.duration} minutes</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Max Score</p>
              <p className="font-medium">{assessment.maxScore}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Type</p>
              <Badge>{assessment.assessmentType}</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button asChild className="w-full">
              <Link href={`/dashboard/assessments/${assessment.id}/edit`}>Edit Assessment</Link>
            </Button>
            <Button variant="outline" className="w-full">View Student Results</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}