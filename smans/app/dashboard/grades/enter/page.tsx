// app/dashboard/grades/enter/page.tsx
import { prisma } from "@/lib/prisma";
import GradeEntryClient from "./GradeEntryClient";

export default async function EnterGradesPage() {
  // Fetch real data
  const [studentsData, subjectsData, activeExam] = await Promise.all([
    prisma.student.findMany({
      where: { status: "ACTIVE" },
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
      where: { isActive: true },
      select: { id: true, name: true, term: true, year: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const examId = activeExam?.id || "";

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
              ? `${activeExam.name} (${activeExam.term} ${activeExam.year})` 
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