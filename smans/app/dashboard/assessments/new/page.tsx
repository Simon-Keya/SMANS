// app/dashboard/assessments/new/page.tsx
"use client";

import AssessmentForm from "@/components/exams/AssessmentForm";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

export default function NewAssessmentPage() {
  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-primary">Schedule New Assessment</h1>
        <Button variant="outline" asChild>
          <Link href="/dashboard/assessments">Back to Assessments</Link>
        </Button>
      </div>

      <AssessmentForm />
    </div>
  );
}