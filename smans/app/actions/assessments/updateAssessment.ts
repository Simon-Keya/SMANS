// app/actions/assessments/updateAssessment.ts
"use server";

import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateAssessmentSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(3).optional(),
  learningAreaId: z.string().min(1).optional(),
  classId: z.string().min(1).optional(),
  date: z.coerce.date().optional(),
  duration: z.number().min(15).optional(),
  maxScore: z.number().min(1).optional(),
  assessmentType: z.enum(["FORMATIVE", "SUMMATIVE", "CBC_CHECK"]).optional(),
});

export async function updateAssessment(input: unknown) {
  const user = await getCurrentUser();

  if (!user || !["ADMIN", "TEACHER"].includes(user.role)) {
    throw new Error("Unauthorized: Only admins and teachers can update assessments");
  }

  const data = updateAssessmentSchema.parse(input);

  const assessment = await prisma.assessment.update({
    where: { id: data.id },
    data: {
      title: data.title,
      learningAreaId: data.learningAreaId,
      classId: data.classId,
      date: data.date,
      duration: data.duration,
      maxScore: data.maxScore,
      assessmentType: data.assessmentType,
    },
    include: {
      learningArea: true,
      class: true,
    },
  });

  return { 
    success: true, 
    message: "Assessment updated successfully",
    assessment 
  };
}