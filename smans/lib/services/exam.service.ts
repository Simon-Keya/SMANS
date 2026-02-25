// lib/services/exam.service.ts
import { prisma } from "@/lib/prisma";

export class ExamService {
  /**
   * Create a new exam
   */
  static async createExam(data: {
    name: string;
    term?: string | null;
    date: Date;
    classId: string;
  }) {
    const { name, term, date, classId } = data;

    // Validate class exists
    const cls = await prisma.class.findUnique({ where: { id: classId } });
    if (!cls) throw new Error("Class not found");

    return prisma.exam.create({
      data: {
        name: name.trim(),
        term: term?.trim() ?? null,
        date,
        classId,
      },
      include: {
        class: { select: { name: true, level: true } },
      },
    });
  }

  /**
   * Record bulk grades for an exam
   */
  static async recordBulkGrades(
    examId: string,
    grades: Array<{
      studentId: string;
      subjectId: string;
      marks: number;
      maxMarks: number;
    }>
  ) {
    // Validate exam exists
    const exam = await prisma.exam.findUnique({ where: { id: examId } });
    if (!exam) throw new Error("Exam not found");

    return prisma.$transaction(async (tx) => {
      const results = [];

      for (const g of grades) {
        const result = await tx.grade.upsert({
          where: {
            studentId_examId_subjectId: {
              studentId: g.studentId,
              examId,
              subjectId: g.subjectId,
            },
          },
          update: {
            marks: g.marks,
            maxMarks: g.maxMarks,
          },
          create: {
            studentId: g.studentId,
            examId,
            subjectId: g.subjectId,
            marks: g.marks,
            maxMarks: g.maxMarks,
          },
        });
        results.push(result);
      }

      return results;
    });
  }

  /**
   * Get all exams for a class
   */
  static async getExamsForClass(classId: string) {
    return prisma.exam.findMany({
      where: { classId },
      orderBy: { date: "desc" },
      include: {
        grades: true,
      },
    });
  }
}