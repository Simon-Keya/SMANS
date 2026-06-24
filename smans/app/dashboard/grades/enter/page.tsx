// app/dashboard/grades/enter/page.tsx
import { prisma } from "@/lib/prisma";
import GradeEntryClient from "./GradeEntryClient";
import { requireRole } from "@/lib/permissions";
import { redirect } from "next/navigation";

export default async function EnterGradesPage() {
  // ✅ Only ADMIN and TEACHER can enter grades
  // requireRole uses spread operator, so pass as separate arguments
  try {
    await requireRole(["ADMIN", "TEACHER"]);;
  } catch (error) {
    redirect("/dashboard");
  }

  // Fetch real data
  const [studentsData, subjectsData, activeExam] = await Promise.all([
    prisma.student.findMany({
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
      select: { 
        id: true, 
        name: true, 
        term: true,
        date: true,
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const examId = activeExam?.id || "";
  const examYear = activeExam?.date ? new Date(activeExam.date).getFullYear() : new Date().getFullYear();

  const students = studentsData.map((s) => ({
    id: s.id,
    name: s.name,
    admissionNumber: s.admissionNumber || "",
  }));

  const subjects = subjectsData.map((s) => ({
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