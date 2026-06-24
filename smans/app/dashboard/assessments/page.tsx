// app/dashboard/assessments/page.tsx
import AssessmentTable from "@/components/exams/AssessmentTable";
import { Button } from "@/components/ui/Button";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { Plus } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/permissions";

export default async function AssessmentsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/login");
  }

  // ✅ Everyone can view assessments (ADMIN, TEACHER, STUDENT, PARENT)
  const userRole = user.role as string;

  // Build where clause based on role
  let whereClause: any = {};

  if (userRole === "TEACHER") {
    // Teachers see assessments for their classes
    const teacherClasses = await prisma.class.findMany({
      where: { teacherId: user.id },
      select: { id: true },
    });
    const classIds = teacherClasses.map(c => c.id);
    whereClause = { classId: { in: classIds } };
  } else if (userRole === "STUDENT") {
    // Students see assessments for their class
    const student = await prisma.student.findFirst({
      where: { userId: user.id },
      select: { classId: true },
    });
    if (student) {
      whereClause = { classId: student.classId };
    }
  } else if (userRole === "PARENT") {
    // Parents see assessments for their children's classes
    const children = await prisma.student.findMany({
      where: { parent: { userId: user.id } },
      select: { classId: true },
    });
    const classIds = children.map(c => c.classId);
    whereClause = { classId: { in: classIds } };
  }
  // ADMIN sees all assessments (no where clause)

  const assessments = await prisma.assessment.findMany({
    where: whereClause,
    include: {
      learningArea: { select: { name: true } },
      class: { select: { name: true } },
    },
    orderBy: { date: "desc" },
  });

  // Add a computed status field based on date
  const assessmentsWithStatus = assessments.map(assessment => ({
    ...assessment,
    status: getAssessmentStatus(assessment.date)
  }));

  // ✅ Only ADMIN and TEACHER can create assessments
  const canCreate = ["ADMIN", "TEACHER"].includes(userRole);
  // ✅ Only ADMIN and TEACHER can delete assessments
  const canDelete = ["ADMIN", "TEACHER"].includes(userRole);

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary">Assessments</h1>
          <p className="text-muted-foreground">Manage CBC assessments and progress checks</p>
        </div>

        {canCreate && (
          <Button asChild>
            <Link href="/dashboard/assessments/new">
              <Plus className="mr-2 h-4 w-4" />
              New Assessment
            </Link>
          </Button>
        )}
      </div>

      <AssessmentTable 
        assessments={assessmentsWithStatus} 
        onDelete={canDelete ? async (id: string) => {
          "use server";
          // Call delete API or server action
          console.log("Delete assessment:", id);
        } : undefined}
      />
    </div>
  );
}

// Helper function to determine assessment status
function getAssessmentStatus(date: Date): "UPCOMING" | "COMPLETED" | "IN_PROGRESS" {
  const today = new Date();
  const assessmentDate = new Date(date);
  
  if (assessmentDate > today) {
    return "UPCOMING";
  } else if (assessmentDate.toDateString() === today.toDateString()) {
    return "IN_PROGRESS";
  } else {
    return "COMPLETED";
  }
}