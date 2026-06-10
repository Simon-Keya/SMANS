// app/actions/exams/generateReportCard.ts
"use server";

import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

type ReportCardInput = {
  studentId: string;
  term: string; // Changed from specific union to string since term is String? in schema
  year: number;
};

export async function generateReportCard(input: ReportCardInput) {
  const user = await getCurrentUser();

  if (!user || !["ADMIN", "ACCOUNTANT", "TEACHER"].includes(user.role)) {
    throw new Error("Unauthorized: Only authorized staff can generate report cards");
  }

  const { studentId, term, year } = input;

  // Fetch student with admissionNumber
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    select: {
      id: true,
      name: true,
      admissionNumber: true,
      class: {
        select: {
          name: true,
          level: true,
        },
      },
    },
  });

  if (!student) {
    throw new Error("Student not found");
  }

  // Fetch grades - removed year filter since it doesn't exist in Exam model
  const grades = await prisma.grade.findMany({
    where: {
      studentId,
      exam: {
        term: term, // Only filter by term since year doesn't exist
      },
    },
    include: {
      subject: {
        select: { id: true, name: true, code: true },
      },
      exam: {
        select: { id: true, name: true, date: true, term: true },
      },
    },
    orderBy: [
      { subject: { name: "asc" } },
      { exam: { date: "asc" } },
    ],
  });

  // Optionally filter by year using exam date if needed
  const filteredGrades = grades.filter(grade => {
    if (!year) return true;
    // Filter by year from exam date
    return grade.exam.date.getFullYear() === year;
  });

  if (filteredGrades.length === 0) {
    throw new Error(`No results found for ${term} ${year}`);
  }

  // Group by subject with explicit typing
  const subjectPerformance = filteredGrades.reduce((acc: Record<string, any>, grade: any) => {
    const subjectName = grade.subject.name;

    if (!acc[subjectName]) {
      acc[subjectName] = {
        subjectId: grade.subject.id,
        subject: subjectName,
        code: grade.subject.code,
        assessments: [],
        totalMarks: 0,
        maxMarks: 0,
        average: 0,
        overallCompetency: null as string | null,
        overallRemarks: "",
      };
    }

    acc[subjectName].assessments.push({
      examName: grade.exam.name,
      examDate: grade.exam.date,
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

  // Calculate averages and CBC competency levels
  Object.values(subjectPerformance).forEach((perf: any) => {
    perf.average = perf.maxMarks > 0 
      ? Math.round((perf.totalMarks / perf.maxMarks) * 100) 
      : 0;

    if (perf.average >= 80) perf.overallCompetency = "EXCEEDING_EXPECTATIONS";
    else if (perf.average >= 65) perf.overallCompetency = "MEETING_EXPECTATIONS";
    else if (perf.average >= 50) perf.overallCompetency = "APPROACHING_EXPECTATIONS";
    else perf.overallCompetency = "BELOW_EXPECTATIONS";
  });

  return {
    success: true,
    reportCard: {
      student: {
        id: student.id,
        name: student.name,
        admissionNumber: student.admissionNumber,
        className: student.class?.name,
        level: student.class?.level,
      },
      term,
      year,
      totalSubjects: Object.keys(subjectPerformance).length,
      subjects: Object.values(subjectPerformance),
      generatedAt: new Date().toISOString(),
      generatedBy: user.name || user.email,
      academicYear: `${year} - ${year + 1}`,
    },
  };
}