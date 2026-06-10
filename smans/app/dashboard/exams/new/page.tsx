import ExamForm from "@/components/exams/AssessmentForm";
import { authOptions } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export default async function NewExamPage() {
  const session = await getServerSession(authOptions);

  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "TEACHER")) {
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
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-primary">Schedule New Exam</h1>
      <ExamForm 
        learningAreas={learningAreas}
        classes={classes}
      />
    </div>
  );
}