// app/actions/transcripts/generateTranscript.ts
"use server";

import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

type GenerateTranscriptInput = {
  studentId: string;
  term: "TERM_1" | "TERM_2" | "TERM_3";
  year: number;
};

export async function generateTranscript(input: GenerateTranscriptInput) {
  const user = await getCurrentUser();

  if (!user || !["ADMIN", "TEACHER"].includes(user.role)) {
    throw new Error("Unauthorized: Only admins and teachers can generate transcripts");
  }

  const { studentId, term, year } = input;

  const student = await prisma.student.findUnique({
    where: { id: studentId },
    select: { 
      id: true, 
      name: true, 
      admissionNumber: true   // ← Changed from rollNumber
    },
  });

  if (!student) throw new Error("Student not found");

  const grades = await prisma.grade.findMany({
    where: {
      studentId,
      exam: { term, year },
    },
    include: {
      subject: { select: { name: true, code: true } },
      exam: { select: { name: true, date: true } },
    },
    orderBy: { subject: { name: "asc" } },
  });

  if (grades.length === 0) {
    throw new Error(`No CBC assessments found for ${term} ${year}`);
  }

  // Group and calculate performance per subject
  const subjectPerformance = grades.reduce((acc: Record<string, any>, grade: any) => {
    const subjectName = grade.subject.name;

    if (!acc[subjectName]) {
      acc[subjectName] = {
        subject: subjectName,
        code: grade.subject.code,
        assessments: [],
        totalMarks: 0,
        maxMarks: 0,
        averagePercentage: 0,
        overallCompetency: null as string | null,
        overallRemarks: "",
      };
    }

    acc[subjectName].assessments.push({
      examName: grade.exam.name,
      marks: grade.marks,
      maxMarks: grade.maxMarks,
      assessmentType: grade.assessmentType,
      competencyLevel: grade.competencyLevel,
      remarks: grade.remarks,
    });

    acc[subjectName].totalMarks += grade.marks;
    acc[subjectName].maxMarks += grade.maxMarks;

    return acc;
  }, {});

  // Calculate CBC competency levels
  Object.values(subjectPerformance).forEach((perf: any) => {
    perf.averagePercentage = perf.maxMarks > 0 
      ? Math.round((perf.totalMarks / perf.maxMarks) * 100) 
      : 0;

    if (perf.averagePercentage >= 80) perf.overallCompetency = "EXCEEDING_EXPECTATIONS";
    else if (perf.averagePercentage >= 65) perf.overallCompetency = "MEETING_EXPECTATIONS";
    else if (perf.averagePercentage >= 50) perf.overallCompetency = "APPROACHING_EXPECTATIONS";
    else perf.overallCompetency = "BELOW_EXPECTATIONS";
  });

  try {
    const transcript = await prisma.transcript.upsert({
      where: {
        studentId_term_year: { studentId, term, year },
      },
      update: {
        gpa: Number(
          (
            Object.values(subjectPerformance).reduce(
              (sum: number, s: any) => sum + s.averagePercentage, 
              0
            ) / Object.keys(subjectPerformance).length
          ).toFixed(2)
        ),
      },
      create: {
        studentId,
        term,
        year,
        gpa: Number(
          (
            Object.values(subjectPerformance).reduce(
              (sum: number, s: any) => sum + s.averagePercentage, 
              0
            ) / Object.keys(subjectPerformance).length
          ).toFixed(2)
        ),
      },
    });

    return {
      success: true,
      transcript,
      subjectPerformance: Object.values(subjectPerformance),
      student: {
        id: student.id,
        name: student.name,
        admissionNumber: student.admissionNumber,   // ← Added for frontend convenience
      },
      message: `CBC Transcript generated for ${term} ${year}`,
    };
  } catch (error) {
    console.error("Generate transcript error:", error);
    throw new Error("Failed to generate transcript. Please try again.");
  }
}