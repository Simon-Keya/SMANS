// app/dashboard/grades/view/page.tsx
import GradeTable from "@/components/grades/GradeTable";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

// Define types for better TypeScript support
type GradeWithRelations = {
  id: string;
  marks: number;
  maxMarks: number;
  competencyLevel: string | null;
  createdAt: Date;
  updatedAt: Date;
  student: {
    name: string;
    admissionNumber: string;
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
  studentName?: string;
  admissionNumber?: string;
};

export default async function ViewGradesPage() {
  const session = await getServerSession();
  
  if (!session) {
    redirect("/auth/login");
  }

  const userRole = session.user.role as string;

  // Fetch grades based on role with proper typing
  let gradesData: GradeWithRelations[] = [];

  if (userRole === "STUDENT") {
    // Students see their own grades
    const student = await prisma.student.findFirst({
      where: { userId: session.user.id },
    });
    
    if (student) {
      const data = await prisma.grade.findMany({
        where: { studentId: student.id },
        include: {
          student: { 
            select: { 
              name: true, 
              admissionNumber: true 
            } 
          },
          subject: { select: { name: true, code: true } },
          exam: { select: { name: true, term: true, year: true } },
        },
        orderBy: { createdAt: "desc" },
      });
      gradesData = data as GradeWithRelations[];
    }
  } else if (userRole === "PARENT") {
    // Parents see their children's grades
    const children = await prisma.student.findMany({
      where: { parent: { userId: session.user.id } },
      select: { id: true },
    });
    
    if (children.length > 0) {
      const data = await prisma.grade.findMany({
        where: { studentId: { in: children.map(c => c.id) } },
        include: {
          student: { 
            select: { 
              name: true, 
              admissionNumber: true 
            } 
          },
          subject: { select: { name: true, code: true } },
          exam: { select: { name: true, term: true, year: true } },
        },
        orderBy: { createdAt: "desc" },
      });
      gradesData = data as GradeWithRelations[];
    }
  } else if (["ADMIN", "TEACHER"].includes(userRole)) {
    // Admins and teachers see all grades (or their students' grades)
    const data = await prisma.grade.findMany({
      include: {
        student: { 
          select: { 
            name: true, 
            admissionNumber: true 
          } 
        },
        subject: { select: { name: true, code: true } },
        exam: { select: { name: true, term: true, year: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });
    gradesData = data as GradeWithRelations[];
  }

  // Transform grades for display with proper typing
  const grades: GradeDisplay[] = gradesData.map((g) => ({
    subject: g.subject.name,
    marks: g.marks,
    maxMarks: g.maxMarks,
    competencyLevel: g.competencyLevel || "APPROACHING_EXPECTATIONS",
    examName: g.exam.name,
    term: g.exam.term || "TERM_1",
    year: g.exam.year || new Date().getFullYear(),
    studentName: g.student?.name,
    admissionNumber: g.student?.admissionNumber,
  }));

  // Calculate summary statistics
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

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-primary">My Grades</h1>
          <p className="text-muted-foreground mt-1">
            View your CBC assessment results and progress
          </p>
        </div>
        {grades.length > 0 && (
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Overall Average</p>
            <p className="text-2xl font-bold text-primary">{overallPercentage}%</p>
            <p className="text-sm font-semibold text-primary">Grade: {overallGrade}</p>
          </div>
        )}
      </div>

      {grades.length === 0 ? (
        <div className="text-center py-12 bg-base-200 rounded-lg">
          <p className="text-base-content/60">No grades available yet.</p>
          <p className="text-sm text-base-content/40 mt-2">
            {userRole === "STUDENT" && "Your grades will appear here once assessments are completed."}
            {userRole === "PARENT" && "Your children's grades will appear here once assessments are completed."}
            {["ADMIN", "TEACHER"].includes(userRole) && "No grades have been recorded yet."}
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-base-200 rounded-lg p-4 text-center">
              <p className="text-sm text-muted-foreground">Total Assessments</p>
              <p className="text-2xl font-bold text-primary">{grades.length}</p>
            </div>
            <div className="bg-base-200 rounded-lg p-4 text-center">
              <p className="text-sm text-muted-foreground">Average Score</p>
              <p className="text-2xl font-bold text-primary">{overallPercentage}%</p>
            </div>
            <div className="bg-base-200 rounded-lg p-4 text-center">
              <p className="text-sm text-muted-foreground">Overall Grade</p>
              <p className="text-2xl font-bold text-primary">{overallGrade}</p>
            </div>
          </div>

          <GradeTable grades={grades} />
        </>
      )}
    </div>
  );
}