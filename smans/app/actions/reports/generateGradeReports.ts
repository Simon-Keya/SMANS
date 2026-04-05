"use server";

import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

export async function generateGradeReport(examId: string) {
  const user = await getCurrentUser();

  if (!user || !["ADMIN", "TEACHER"].includes(user.role)) {
    throw new Error("Unauthorized: Only admins and teachers can generate grade reports");
  }

  try {
    const grades = await prisma.grade.findMany({
      where: { examId },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            admissionNumber: true, // ← Changed
          },
        },
        subject: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        exam: {
          select: {
            id: true,
            name: true,
            date: true,
            term: true,
          },
        },
      },
      orderBy: [
        { student: { name: "asc" } },
        { subject: { name: "asc" } },
      ],
    });

    if (grades.length === 0) {
      throw new Error("No grades found for this exam");
    }

    const studentGrades = grades.reduce((acc: Record<string, any>, grade: any) => {
      const studentId = grade.student.id;

      if (!acc[studentId]) {
        acc[studentId] = {
          studentId,
          studentName: grade.student.name,
          admissionNumber: grade.student.admissionNumber, // ← Changed
          subjects: [],
        };
      }

      acc[studentId].subjects.push({
        subject: grade.subject.name,
        code: grade.subject.code,
        marks: grade.marks,
        maxMarks: grade.maxMarks,
        percentage: grade.maxMarks > 0 ? Math.round((grade.marks / grade.maxMarks) * 100) : 0,
        assessmentType: grade.assessmentType,
        competencyLevel: grade.competencyLevel,
        remarks: grade.remarks,
      });

      return acc;
    }, {});

    return {
      success: true,
      examId,
      totalStudents: Object.keys(studentGrades).length,
      totalGrades: grades.length,
      studentGrades: Object.values(studentGrades),
      generatedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Generate grade report error:", error);
    throw new Error("Failed to generate grade report. Please try again.");
  }
}