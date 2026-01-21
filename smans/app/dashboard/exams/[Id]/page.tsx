import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { prisma } from "@/lib/prisma";
import { ArrowLeft, Edit } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

interface ExamDetailPageProps {
  params: { id: string };
}

export default async function ExamDetailPage({ params }: ExamDetailPageProps) {
  const exam = await prisma.exam.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      title: true,
      subject: { select: { name: true } },
      class: { select: { name: true } },
      date: true,
      duration: true,
      maxScore: true,
      status: true,
      createdAt: true,
    },
  });

  if (!exam) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/exams">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="text-3xl font-bold text-primary">{exam.title}</h1>
        </div>
        <Button asChild variant="outline" className="gap-2">
          <Link href={`/dashboard/exams/${exam.id}/edit`}>
            <Edit className="h-4 w-4" />
            Edit
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="bg-base-100 shadow-lg border border-base-200">
          <CardHeader>
            <CardTitle className="text-xl text-primary">Exam Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-base-content/60">Subject</p>
              <p className="font-medium">{exam.subject?.name ?? "Not assigned"}</p>
            </div>
            <div>
              <p className="text-sm text-base-content/60">Class</p>
              <p className="font-medium">{exam.class?.name ?? "Not assigned"}</p>
            </div>
            <div>
              <p className="text-sm text-base-content/60">Date</p>
              <p className="font-medium">
                {new Date(exam.date).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-base-content/60">Duration</p>
              <p className="font-medium">{exam.duration} minutes</p>
            </div>
            <div>
              <p className="text-sm text-base-content/60">Maximum Score</p>
              <p className="font-medium">{exam.maxScore}</p>
            </div>
            <div>
              <p className="text-sm text-base-content/60">Status</p>
              <p className="font-medium capitalize">{exam.status}</p>
            </div>
          </CardContent>
        </Card>

        {/* You can add results preview, student list, etc. here */}
      </div>
    </div>
  );
}