// app/dashboard/grades/page.tsx
import GradeTable from "@/components/grades/GradeTable";
import ReportCard from "@/components/reports/ReportCard";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/permissions";

export default async function StudentGradesPage() {
  const session = await getServerSession();
  
  if (!session) {
    redirect("/auth/login");
  }

  // ✅ All authenticated users can view grades
  const userRole = session.user.role as string;
  
  // Fetch real grades data
  const gradesData = await prisma.grade.findMany({
    where: {
      // For STUDENT: only their grades
      // For PARENT: their children's grades
      // For TEACHER: all grades they've entered
      // For ADMIN: all grades
      ...(userRole === "STUDENT" && {
        student: { userId: session.user.id }
      }),
      ...(userRole === "PARENT" && {
        student: {
          parent: { userId: session.user.id }
        }
      }),
    },
    include: {
      student: {
        select: { 
          name: true, 
          admissionNumber: true,
          class: { select: { name: true } }
        }
      },
      subject: { select: { name: true, code: true } },
      exam: { select: { name: true, term: true, year: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  // Fetch student info for report card
  const studentInfo = await prisma.student.findFirst({
    where: {
      ...(userRole === "STUDENT" && { userId: session.user.id }),
      ...(userRole === "PARENT" && {
        parent: { userId: session.user.id }
      }),
    },
    include: {
      class: { select: { name: true } },
    },
    take: 1,
  });

  // Transform grades for display
  const grades = gradesData.map((g) => ({
    subject: g.subject.name,
    marks: g.marks,
    maxMarks: g.maxMarks,
    competencyLevel: g.competencyLevel || "APPROACHING_EXPECTATIONS",
    examName: g.exam.name,
    term: g.exam.term || "TERM_1",
    year: g.exam.year || new Date().getFullYear(),
  }));

  // Calculate overall stats
  const totalMarks = grades.reduce((sum, g) => sum + g.marks, 0);
  const totalMaxMarks = grades.reduce((sum, g) => sum + g.maxMarks, 0);
  const overallPercentage = totalMaxMarks > 0 ? Math.round((totalMarks / totalMaxMarks) * 100) : 0;
  
  const getGrade = (percentage: number) => {
    if (percentage >= 80) return "A";
    if (percentage >= 70) return "B+";
    if (percentage >= 60) return "B";
    if (percentage >= 50) return "C+";
    if (percentage >= 40) return "C";
    return "D";
  };

  const overallGrade = getGrade(overallPercentage);

  const getCompetency = (percentage: number) => {
    if (percentage >= 80) return "EXCEEDING_EXPECTATIONS";
    if (percentage >= 65) return "MEETING_EXPECTATIONS";
    if (percentage >= 50) return "APPROACHING_EXPECTATIONS";
    return "BELOW_EXPECTATIONS";
  };

  const overallCompetency = getCompetency(overallPercentage);

  const studentName = studentInfo?.name || session.user.name || "Student";
  const admissionNumber = studentInfo?.admissionNumber || "N/A";
  const className = studentInfo?.class?.name || "Not Assigned";

  return (
    <div className="space-y-10 p-6">
      <div>
        <h1 className="text-4xl font-bold tracking-tight">Student Grades & Reports</h1>
        <p className="text-muted-foreground mt-2">
          CBC Progress Reports and Assessment Records
        </p>
      </div>

      {grades.length === 0 ? (
        <div className="text-center py-12 bg-base-200 rounded-lg">
          <p className="text-base-content/60">No grades available yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h2 className="text-2xl font-semibold mb-6">Recent Assessments</h2>
            <GradeTable grades={grades} />
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-6">Report Card</h2>
            <ReportCard
              studentName={studentName}
              admissionNumber={admissionNumber}
              className={className}
              term="CURRENT_TERM"
              year={new Date().getFullYear()}
              grades={grades}
              overallPercentage={overallPercentage}
              overallGrade={overallGrade}
              overallCompetency={overallCompetency}
              remarks={`${studentName} has shown ${overallPercentage >= 65 ? 'good' : 'steady'} progress. Continue to build on strengths and work on areas that need improvement.`}
              generatedBy={session.user.name || "System"}
            />
          </div>
        </div>
      )}
    </div>
  );
}