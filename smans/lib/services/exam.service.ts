import { prisma } from "@/lib/db/prisma";
import { examSchema } from "@/lib/validators/exam.schema";
import { z } from "zod";

type ExamCreateInput = z.infer<typeof examSchema>;

export class ExamService {
  static async create(data: ExamCreateInput) {
    const validated = examSchema.parse(data);

    return prisma.exam.create({
      data: {
        name: validated.name.trim(),
        term: validated.term?.trim() ?? null,
        date: validated.date,
        classId: validated.classId,
      },
    });
  }

  static async recordResults(examId: string, results: { studentId: string; subjectId: string; marks: number; maxMarks: number }[]) {
    return prisma.$transaction(
      results.map(r =>
        prisma.grade.upsert({
          where: {
            studentId_examId_subjectId: {
              studentId: r.studentId,
              examId,
              subjectId: r.subjectId,
            },
          },
          update: { marks: r.marks, maxMarks: r.maxMarks },
          create: {
            studentId: r.studentId,
            examId,
            subjectId: r.subjectId,
            marks: r.marks,
            maxMarks: r.maxMarks,
          },
        })
      )
    );
  }
}