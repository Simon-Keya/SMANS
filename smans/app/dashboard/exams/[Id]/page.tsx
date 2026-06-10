import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { prisma } from "@/lib/prisma";
import { ArrowLeft, Edit } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

interface ExamDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ExamDetailPage({ params }: ExamDetailPageProps) {
  const { id } = await params;
  
  const exam = await prisma.exam.findUnique({
    where: { id },
    select: {
      id: true,
      name: true, // Changed from 'title' to 'name'
      class: { 
        select: { 
          id: true,
          name: true 
        } 
      },
      date: true,
      term: true,
      createdAt: true,
      updatedAt: true,
      grades: {
        take: 1, // Just to check if any grades exist
      },
    },
  });

  if (!exam) {
    notFound();
  }

  // Since Exam doesn't have subject, duration, maxScore, status in your schema
  // You might want to get subject information from related grades if needed
  // For now, we'll show what's available

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/exams">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="text-3xl font-bold text-primary">{exam.name}</h1>
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
              <p className="text-sm text-base-content/60">Exam Name</p>
              <p className="font-medium">{exam.name}</p>
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
              <p className="text-sm text-base-content/60">Term</p>
              <p className="font-medium">{exam.term || "Not specified"}</p>
            </div>
            <div>
              <p className="text-sm text-base-content/60">Has Results</p>
              <p className="font-medium">{exam.grades.length > 0 ? "Yes" : "No"}</p>
            </div>
            <div>
              <p className="text-sm text-base-content/60">Created</p>
              <p className="font-medium">
                {new Date(exam.createdAt).toLocaleDateString()}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* You can add results preview, student list, etc. here */}
      </div>
    </div>
  );
}