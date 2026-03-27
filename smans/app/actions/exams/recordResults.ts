// app/actions/exams/recordResults.ts
"use server";

import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// CBC Assessment Types used in Kenyan schools
const assessmentTypes = [
  "TEST", "PROJECT", "PRACTICAL", "OBSERVATION", 
  "ORAL", "PORTFOLIO", "GROUP_WORK", "ASSIGNMENT"
] as const;

// CBC Competency Levels
const competencyLevels = [
  "EXCEEDING_EXPECTATIONS",
  "MEETING_EXPECTATIONS",
  "APPROACHING_EXPECTATIONS",
  "BELOW_EXPECTATIONS"
] as const;

const resultSchema = z.object({
  studentId: z.string().min(1),
  subjectId: z.string().min(1),
  marks: z.number().min(0).max(100),
  maxMarks: z.number().min(1).default(100),
  assessmentType: z.enum(assessmentTypes).default("TEST"),
  competencyLevel: z.enum(competencyLevels).optional(),
  remarks: z.string().max(500).optional(),
});

const recordResultsSchema = z.object({
  examId: z.string().min(1),
  term: z.enum(["TERM_1", "TERM_2", "TERM_3"]).optional(),
  results: z.array(resultSchema).min(1),
});

export async function recordResults(input: unknown) {
  const user = await getCurrentUser();

  if (!user || !["ADMIN", "ACCOUNTANT", "TEACHER"].includes(user.role)) {
    throw new Error("Unauthorized: Only teachers, accountants and admins can record CBC results");
  }

  const validated = recordResultsSchema.safeParse(input);
  if (!validated.success) {
    throw new Error(validated.error.issues[0]?.message || "Invalid input");
  }

  const { examId, term, results } = validated.data;

  // Verify exam exists
  const exam = await prisma.exam.findUnique({
    where: { id: examId },
    select: { id: true, name: true, classId: true },
  });

  if (!exam) throw new Error("Exam not found");

  try {
    const createdGrades = await prisma.$transaction(
      results.map((r) =>
        prisma.grade.upsert({
          where: {
            studentId_subjectId_examId: {
              studentId: r.studentId,
              subjectId: r.subjectId,
              examId,
            },
          },
          update: {
            marks: r.marks,
            maxMarks: r.maxMarks,
            assessmentType: r.assessmentType,
            competencyLevel: r.competencyLevel || null,
            remarks: r.remarks?.trim() || null,
          },
          create: {
            studentId: r.studentId,
            subjectId: r.subjectId,
            examId,
            marks: r.marks,
            maxMarks: r.maxMarks,
            assessmentType: r.assessmentType,
            competencyLevel: r.competencyLevel || null,
            remarks: r.remarks?.trim() || null,
          },
        })
      )
    );

    // Audit log for CBC compliance
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "RECORD_CBC_RESULTS",
        entity: "Exam",
        entityId: examId,
        metadata: {
          term,
          resultCount: results.length,
          recordedBy: user.role,
          learningAreas: [...new Set(results.map(r => r.subjectId))],
        },
      },
    });

    return {
      success: true,
      message: `Successfully recorded ${results.length} CBC assessment(s)`,
      grades: createdGrades,
    };
  } catch (error: any) {
    console.error("Record CBC results error:", error);
    throw new Error(error.message || "Failed to record results. Please try again.");
  }
}