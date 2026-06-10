// app/dashboard/grades/enter/page.tsx
import { prisma } from "@/lib/prisma";
import GradeEntryClient from "./GradeEntryClient";

export default async function EnterGradesPage() {
  // Fetch real data - removed 'status' filter since Student model doesn't have it
  const [studentsData, subjectsData, activeExam] = await Promise.all([
    prisma.student.findMany({
      // Removed status filter - Student model doesn't have this field
      select: {
        id: true,
        name: true,
        admissionNumber: true,
      },
      orderBy: { name: "asc" },
    }),
    prisma.subject.findMany({
      select: {
        id: true,
        name: true,
      },
      orderBy: { name: "asc" },
    }),
    prisma.exam.findFirst({
      // Removed isActive filter - Exam model doesn't have this field
      select: { 
        id: true, 
        name: true, 
        term: true,
        // Removed 'year' - Exam model doesn't have this field
        date: true, // Use date instead to get year information
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const examId = activeExam?.id || "";
  
  // Get year from exam date if available
  const examYear = activeExam?.date ? new Date(activeExam.date).getFullYear() : new Date().getFullYear();

  // Explicit typing to fix "implicitly has 'any' type"
  const students = studentsData.map((s: { id: string; name: string; admissionNumber: string | null }) => ({
    id: s.id,
    name: s.name,
    admissionNumber: s.admissionNumber || "",
  }));

  const subjects = subjectsData.map((s: { id: string; name: string }) => ({
    id: s.id,
    name: s.name,
  }));

  return (
    <div className="max-w-5xl mx-auto py-10 px-6">
      <div className="mb-10">
        <h1 className="text-4xl font-bold tracking-tight">CBC Grade Entry</h1>
        <p className="text-muted-foreground mt-2 text-lg">
          Record learner performance for{" "}
          <span className="font-medium">
            {activeExam 
              ? `${activeExam.name} (${activeExam.term || "Current Term"} ${examYear})` 
              : "Current Assessment"}
          </span>
        </p>
      </div>

      {students.length === 0 || subjects.length === 0 ? (
        <div className="text-center py-20 border rounded-xl bg-muted/30">
          <p className="text-xl text-muted-foreground">
            No students or subjects found. Please add them first.
          </p>
        </div>
      ) : (
        <GradeEntryClient
          examId={examId}
          students={students}
          subjects={subjects}
        />
      )}
    </div>
  );
}