// app/actions/exams/getReportCard.ts
"use server";

import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

export async function getReportCard(studentId: string) {
  const user = await getCurrentUser();

  if (!user || !["ADMIN", "TEACHER", "ACCOUNTANT"].includes(user.role)) {
    throw new Error("Unauthorized");
  }

  const student = await prisma.student.findUnique({
    where: { id: studentId },
    select: {
      id: true,
      name: true,
      admissionNumber: true,        // ← Changed from rollNumber
      class: { select: { name: true, level: true } },
    },
  });

  if (!student) throw new Error("Student not found");

  const transcripts = await prisma.transcript.findMany({
    where: { studentId },
    orderBy: { year: "desc", term: "desc" },
  });

  const reportCards = await Promise.all(
    transcripts.map(async (transcript: any) => {
      const grades = await prisma.grade.findMany({
        where: {
          studentId,
          exam: {
            term: transcript.term,
            year: transcript.year,
          },
        },
        include: {
          subject: { select: { name: true, code: true } },
          exam: { select: { name: true, date: true } },
        },
        orderBy: { subject: { name: "asc" } },
      });

      // Group grades by subject
      const grouped = grades.reduce((acc: Record<string, any>, grade: any) => {
        const key = grade.subject.name;

        if (!acc[key]) {
          acc[key] = {
            subject: grade.subject.name,
            code: grade.subject.code,
            assessments: [],
            average: 0,
            competencyLevel: null,
          };
        }

        acc[key].assessments.push({
          exam: grade.exam.name,
          marks: grade.marks,
          maxMarks: grade.maxMarks,
          assessmentType: grade.assessmentType,
          competencyLevel: grade.competencyLevel,
          remarks: grade.remarks,
        });

        return acc;
      }, {});

      // Calculate average per subject
      Object.values(grouped).forEach((subj: any) => {
        const total = subj.assessments.reduce((sum: number, a: any) => sum + a.marks, 0);
        const max = subj.assessments.reduce((sum: number, a: any) => sum + a.maxMarks, 0);
        subj.average = max > 0 ? Math.round((total / max) * 100) : 0;
      });

      return {
        ...transcript,
        student,
        subjects: Object.values(grouped),
      };
    })
  );

  return {
    success: true,
    student: {
      id: student.id,
      name: student.name,
      admissionNumber: student.admissionNumber,   // ← Changed
      class: student.class,
    },
    reportCards,
  };
}