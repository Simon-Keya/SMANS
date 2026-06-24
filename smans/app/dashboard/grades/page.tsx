// app/dashboard/grades/page.tsx
import GradeTable from "@/components/grades/GradeTable";
import ReportCard from "@/components/reports/ReportCard";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

// Define types
type GradeWithRelations = {
  id: string;
  marks: number;
  maxMarks: number;
  competencyLevel: string | null;
  createdAt: Date;
  updatedAt: Date;
  student: {
    id: string; // ✅ Added id
    name: string;
    admissionNumber: string;
    class: { name: string } | null;
  } | null;
  subject: {
    name: string;
    code: string;
  };
  exam: {
    name: string;
    term: string | null;
    year: number | null;
  };
};

type GradeDisplay = {
  subject: string;
  marks: number;
  maxMarks: number;
  competencyLevel: string;
  examName: string;
  term: string;
  year: number;
};

export default async function StudentGradesPage() {
  const session = await getServerSession();
  
  if (!session) {
    redirect("/auth/login");
  }

  // ✅ All authenticated users can view grades
  const userRole = session.user.role as string;
  
  // Build where clause based on role
  let whereClause: any = {};
  
  if (userRole === "STUDENT") {
    // Students see only their own grades
    whereClause = {
      student: { userId: session.user.id }
    };
  } else if (userRole === "PARENT") {
    // Parents see their children's grades
    whereClause = {
      student: {
        parent: { userId: session.user.id }
      }
    };
  } else if (userRole === "TEACHER") {
    // Teachers see grades for students in their classes
    // Get teacher's classes
    const teacherClasses = await prisma.class.findMany({
      where: { teacherId: session.user.id },
      select: { id: true },
    });
    const classIds = teacherClasses.map(c => c.id);
    
    whereClause = {
      student: {
        classId: { in: classIds }
      }
    };
  }
  // ADMIN sees all grades (no where clause)

  // Fetch real grades data with proper typing
  const gradesData = await prisma.grade.findMany({
    where: whereClause,
    include: {
      student: {
        select: { 
          id: true, // ✅ Added id
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
  }) as GradeWithRelations[];

  // Fetch student info for report card
  let studentInfo = null;
  if (userRole === "STUDENT") {
    studentInfo = await prisma.student.findFirst({
      where: { userId: session.user.id },
      include: { class: { select: { name: true } } },
    });
  } else if (userRole === "PARENT") {
    studentInfo = await prisma.student.findFirst({
      where: { parent: { userId: session.user.id } },
      include: { class: { select: { name: true } } },
    });
  } else if (userRole === "TEACHER" || userRole === "ADMIN") {
    // For teachers and admins, show the first student's report card
    if (gradesData.length > 0 && gradesData[0].student) {
      studentInfo = await prisma.student.findFirst({
        where: { id: gradesData[0].student.id },
        include: { class: { select: { name: true } } },
      });
    }
  }

  // Transform grades for display
  const grades: GradeDisplay[] = gradesData.map((g) => ({
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

  // Report card data
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
        {grades.length > 0 && (
          <p className="text-sm text-muted-foreground mt-1">
            Showing grades for: <span className="font-medium">{studentName}</span>
          </p>
        )}
      </div>

      {grades.length === 0 ? (
        <div className="text-center py-12 bg-base-200 rounded-lg">
          <p className="text-base-content/60">No grades available yet.</p>
          <p className="text-sm text-base-content/40 mt-2">
            {userRole === "STUDENT" && "Your grades will appear here once assessments are completed."}
            {userRole === "PARENT" && "Your children's grades will appear here once assessments are completed."}
            {userRole === "TEACHER" && "No grades have been recorded for your students yet."}
            {userRole === "ADMIN" && "No grades have been recorded in the system yet."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h2 className="text-2xl font-semibold mb-6">
              Recent Assessments ({grades.length})
            </h2>
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