// lib/services/academic.service.ts
import { prisma } from "@/lib/prisma";

export class AcademicService {
  /**
   * Get student's academic summary
   */
  static async getStudentAcademicSummary(studentId: string, year?: number) {
    const currentYear = year || new Date().getFullYear();

    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: {
        class: { select: { name: true, level: true } },
      },
    });

    if (!student) throw new Error("Student not found");

    // Get all grades for the student in the specified year
    const grades = await prisma.grade.findMany({
      where: {
        studentId,
        exam: {
          year: currentYear,
        },
      },
      include: {
        subject: { select: { id: true, name: true, code: true } },
        exam: { select: { id: true, name: true, term: true, date: true } },
      },
      orderBy: [{ exam: { term: "asc" } }, { subject: { name: "asc" } }],
    });

    // Group by term
    const terms = ["TERM_1", "TERM_2", "TERM_3"];
    const termResults: Record<string, any> = {};

    for (const term of terms) {
      const termGrades = grades.filter(g => g.exam.term === term);
      
      if (termGrades.length > 0) {
        const totalMarks = termGrades.reduce((sum, g) => sum + g.marks, 0);
        const maxMarks = termGrades.reduce((sum, g) => sum + g.maxMarks, 0);
        const averagePercentage = maxMarks > 0 ? (totalMarks / maxMarks) * 100 : 0;
        
        termResults[term] = {
          term,
          grades: termGrades,
          totalMarks,
          maxMarks,
          averagePercentage: Math.round(averagePercentage),
          subjectCount: termGrades.length,
        };
      }
    }

    // Calculate overall performance
    const allMarks = grades.reduce((sum, g) => sum + g.marks, 0);
    const allMaxMarks = grades.reduce((sum, g) => sum + g.maxMarks, 0);
    const overallAverage = allMaxMarks > 0 ? (allMarks / allMaxMarks) * 100 : 0;

    // Get grade distribution
    const gradeDistribution = {
      excellent: grades.filter(g => (g.marks / g.maxMarks) >= 0.8).length,
      good: grades.filter(g => (g.marks / g.maxMarks) >= 0.65 && (g.marks / g.maxMarks) < 0.8).length,
      satisfactory: grades.filter(g => (g.marks / g.maxMarks) >= 0.5 && (g.marks / g.maxMarks) < 0.65).length,
      belowAverage: grades.filter(g => (g.marks / g.maxMarks) < 0.5).length,
    };

    return {
      student: {
        id: student.id,
        name: student.name,
        admissionNumber: student.admissionNumber,
        className: student.class?.name,
        level: student.class?.level,
      },
      year: currentYear,
      terms: termResults,
      overall: {
        totalMarks: allMarks,
        maxMarks: allMaxMarks,
        averagePercentage: Math.round(overallAverage),
        totalSubjects: new Set(grades.map(g => g.subjectId)).size,
        totalExams: new Set(grades.map(g => g.examId)).size,
      },
      gradeDistribution,
      allGrades: grades,
    };
  }

  /**
   * Get class academic performance
   */
  static async getClassPerformance(classId: string, examId?: string) {
    const classData = await prisma.class.findUnique({
      where: { id: classId },
      include: {
        students: {
          include: {
            grades: {
              where: examId ? { examId } : undefined,
              include: {
                subject: true,
                exam: true,
              },
            },
          },
        },
      },
    });

    if (!classData) throw new Error("Class not found");

    const studentPerformances = classData.students.map(student => {
      const grades = student.grades;
      const totalMarks = grades.reduce((sum, g) => sum + g.marks, 0);
      const maxMarks = grades.reduce((sum, g) => sum + g.maxMarks, 0);
      const average = maxMarks > 0 ? (totalMarks / maxMarks) * 100 : 0;

      return {
        studentId: student.id,
        studentName: student.name,
        admissionNumber: student.admissionNumber,
        totalMarks,
        maxMarks,
        averagePercentage: Math.round(average),
        grades,
      };
    });

    // Calculate class averages
    const classAverage = studentPerformances.length > 0
      ? studentPerformances.reduce((sum, s) => sum + s.averagePercentage, 0) / studentPerformances.length
      : 0;

    return {
      class: {
        id: classData.id,
        name: classData.name,
        level: classData.level,
      },
      totalStudents: studentPerformances.length,
      classAverage: Math.round(classAverage),
      topPerformers: studentPerformances.sort((a, b) => b.averagePercentage - a.averagePercentage).slice(0, 5),
      studentPerformances,
    };
  }

  /**
   * Get subject performance across classes
   */
  static async getSubjectPerformance(subjectId: string, examId?: string) {
    const subject = await prisma.subject.findUnique({
      where: { id: subjectId },
    });

    if (!subject) throw new Error("Subject not found");

    const grades = await prisma.grade.findMany({
      where: {
        subjectId,
        examId: examId || undefined,
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            admissionNumber: true,
            class: { select: { name: true, level: true } },
          },
        },
        exam: true,
      },
    });

    const totalMarks = grades.reduce((sum, g) => sum + g.marks, 0);
    const maxMarks = grades.reduce((sum, g) => sum + g.maxMarks, 0);
    const averageScore = maxMarks > 0 ? (totalMarks / maxMarks) * 100 : 0;

    return {
      subject: {
        id: subject.id,
        name: subject.name,
        code: subject.code,
      },
      totalGrades: grades.length,
      totalStudents: new Set(grades.map(g => g.studentId)).size,
      averageScore: Math.round(averageScore),
      highestScore: Math.max(...grades.map(g => (g.marks / g.maxMarks) * 100)),
      lowestScore: Math.min(...grades.map(g => (g.marks / g.maxMarks) * 100)),
      grades,
    };
  }

  /**
   * Generate transcript for a student
   */
  static async generateTranscript(studentId: string, year: number) {
    const summary = await this.getStudentAcademicSummary(studentId, year);
    
    return {
      ...summary,
      generatedAt: new Date().toISOString(),
      academicYear: `${year} - ${year + 1}`,
    };
  }
}