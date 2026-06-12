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
    year?: number;
  }) {
    const { name, term, date, classId, year } = data;

    // Validate class exists
    const cls = await prisma.class.findUnique({ where: { id: classId } });
    if (!cls) throw new Error("Class not found");

    return prisma.exam.create({
      data: {
        name: name.trim(),
        term: term?.trim() ?? null,
        date,
        classId,
        year: year ?? new Date().getFullYear(),
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
      assessmentType?: string;
      competencyLevel?: string;
      remarks?: string;
    }>
  ) {
    // Validate exam exists
    const exam = await prisma.exam.findUnique({ where: { id: examId } });
    if (!exam) throw new Error("Exam not found");

    return prisma.$transaction(async (tx) => {
      const results = [];

      for (const g of grades) {
        // Use the correct unique constraint syntax
        const result = await tx.grade.upsert({
          where: {
            // The unique constraint name from your schema
            studentId_subjectId_examId: {
              studentId: g.studentId,
              subjectId: g.subjectId,
              examId: examId,
            },
          },
          update: {
            marks: g.marks,
            maxMarks: g.maxMarks,
            assessmentType: g.assessmentType,
            competencyLevel: g.competencyLevel,
            remarks: g.remarks,
          },
          create: {
            studentId: g.studentId,
            examId: examId,
            subjectId: g.subjectId,
            marks: g.marks,
            maxMarks: g.maxMarks,
            assessmentType: g.assessmentType,
            competencyLevel: g.competencyLevel,
            remarks: g.remarks,
          },
        });
        results.push(result);
      }

      return results;
    });
  }

  /**
   * Record a single grade
   */
  static async recordGrade(
    data: {
      studentId: string;
      examId: string;
      subjectId: string;
      marks: number;
      maxMarks?: number;
      assessmentType?: string;
      competencyLevel?: string;
      remarks?: string;
    }
  ) {
    const { studentId, examId, subjectId, marks, maxMarks = 100, assessmentType, competencyLevel, remarks } = data;

    return prisma.grade.upsert({
      where: {
        studentId_subjectId_examId: {
          studentId,
          subjectId,
          examId,
        },
      },
      update: {
        marks,
        maxMarks,
        assessmentType,
        competencyLevel,
        remarks,
      },
      create: {
        studentId,
        examId,
        subjectId,
        marks,
        maxMarks,
        assessmentType,
        competencyLevel,
        remarks,
      },
      include: {
        student: { select: { name: true, admissionNumber: true } },
        subject: { select: { name: true, code: true } },
        exam: { select: { name: true, term: true, year: true } },
      },
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
        class: { select: { name: true, level: true } },
        grades: {
          include: {
            student: { select: { name: true, admissionNumber: true } },
            subject: { select: { name: true, code: true } },
          },
        },
        _count: {
          select: { grades: true },
        },
      },
    });
  }

  /**
   * Get exam by ID with all grades
   */
  static async getExamById(examId: string) {
    return prisma.exam.findUnique({
      where: { id: examId },
      include: {
        class: { select: { id: true, name: true, level: true } },
        grades: {
          include: {
            student: { select: { id: true, name: true, admissionNumber: true, classId: true } },
            subject: { select: { id: true, name: true, code: true } },
          },
        },
        _count: {
          select: { grades: true },
        },
      },
    });
  }

  /**
   * Get exam results for a specific student
   */
  static async getStudentExamResults(studentId: string, examId?: string, year?: number) {
    return prisma.grade.findMany({
      where: {
        studentId,
        examId: examId || undefined,
        exam: {
          year: year || undefined,
        },
      },
      include: {
        exam: { select: { name: true, term: true, date: true, year: true } },
        subject: { select: { name: true, code: true } },
      },
      orderBy: [{ exam: { date: "desc" } }, { subject: { name: "asc" } }],
    });
  }

  /**
   * Get exam statistics
   */
  static async getExamStatistics(examId: string) {
    const grades = await prisma.grade.findMany({
      where: { examId },
      include: {
        subject: true,
        student: true,
      },
    });

    if (grades.length === 0) {
      return {
        examId,
        totalStudents: 0,
        totalGrades: 0,
        averageScore: 0,
        highestScore: 0,
        lowestScore: 0,
        subjectAverages: {},
      };
    }

    const totalScore = grades.reduce((sum, g) => sum + (g.marks / g.maxMarks) * 100, 0);
    const averageScore = totalScore / grades.length;

    // Calculate subject averages
    const subjectScores: Record<string, { total: number; count: number }> = {};
    for (const grade of grades) {
      const percentage = (grade.marks / grade.maxMarks) * 100;
      if (!subjectScores[grade.subjectId]) {
        subjectScores[grade.subjectId] = { total: 0, count: 0 };
      }
      subjectScores[grade.subjectId].total += percentage;
      subjectScores[grade.subjectId].count++;
    }

    const subjectAverages: Record<string, number> = {};
    for (const [subjectId, data] of Object.entries(subjectScores)) {
      subjectAverages[subjectId] = data.total / data.count;
    }

    return {
      examId,
      totalStudents: new Set(grades.map(g => g.studentId)).size,
      totalGrades: grades.length,
      averageScore: Math.round(averageScore),
      highestScore: Math.max(...grades.map(g => (g.marks / g.maxMarks) * 100)),
      lowestScore: Math.min(...grades.map(g => (g.marks / g.maxMarks) * 100)),
      subjectAverages,
    };
  }

  /**
   * Update exam details
   */
  static async updateExam(examId: string, data: {
    name?: string;
    term?: string | null;
    date?: Date;
    year?: number;
  }) {
    return prisma.exam.update({
      where: { id: examId },
      data: {
        name: data.name?.trim(),
        term: data.term?.trim() ?? null,
        date: data.date,
        year: data.year,
      },
      include: {
        class: { select: { name: true, level: true } },
      },
    });
  }

  /**
   * Delete exam (only if no grades exist)
   */
  static async deleteExam(examId: string) {
    const gradeCount = await prisma.grade.count({ where: { examId } });
    if (gradeCount > 0) {
      throw new Error(`Cannot delete exam with ${gradeCount} existing grades. Delete grades first.`);
    }

    return prisma.exam.delete({ where: { id: examId } });
  }
}