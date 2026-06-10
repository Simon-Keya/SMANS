// app/actions/assessments/createAssessment.ts
"use server";

import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createAssessmentSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  learningAreaId: z.string().min(1, "Learning Area is required"),
  classId: z.string().min(1, "Class is required"),
  date: z.coerce.date(),
  duration: z.number().min(15, "Duration must be at least 15 minutes"),
  maxScore: z.number().min(1, "Max score must be greater than 0"),
  assessmentType: z.enum(["FORMATIVE", "SUMMATIVE", "CBC_CHECK"]).default("SUMMATIVE"),
});

export async function createAssessment(input: unknown) {
  const user = await getCurrentUser();

  if (!user || !["ADMIN", "TEACHER"].includes(user.role)) {
    throw new Error("Unauthorized: Only admins and teachers can create assessments");
  }

  const data = createAssessmentSchema.parse(input);

  const assessment = await prisma.assessment.create({
    data: {
      title: data.title,
      learningAreaId: data.learningAreaId,
      classId: data.classId,
      date: data.date,
      duration: data.duration,
      maxScore: data.maxScore,
      assessmentType: data.assessmentType,
      // Removed createdById - it doesn't exist in the schema
    },
    include: {
      learningArea: true,
      class: true,
    },
  });

  // Optionally create an audit log to track who created the assessment
  await prisma.auditLog.create({
    data: {
      userId: user.id,
      action: "CREATE_ASSESSMENT",
      entity: "Assessment",
      entityId: assessment.id,
      metadata: {
        title: assessment.title,
        classId: assessment.classId,
        learningAreaId: assessment.learningAreaId,
        assessmentType: assessment.assessmentType,
      },
    },
  });

  return { 
    success: true, 
    message: "Assessment created successfully",
    assessment 
  };
}