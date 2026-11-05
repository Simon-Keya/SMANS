"use server";

import { requirePermission } from "@/lib/auth/permissions";
import { getCurrentUser } from "@/lib/auth/session";
import { CbcService } from "@/lib/services/cbc.service";
import { z } from "zod";
import { revalidatePath } from "next/cache";

export async function listCurriculumVersionsAction() {
  await requirePermission("curriculum:read");
  return CbcService.listCurriculumVersions();
}

export async function ensureDefaultCompetencyScaleAction() {
  await requirePermission("curriculum:write");
  return CbcService.ensureDefaultScale();
}

export async function createCurriculumVersionAction(input: {
  name: string;
  code: string;
  description?: string;
}) {
  await requirePermission("curriculum:write");
  const schema = z.object({
    name: z.string().min(1),
    code: z.string().min(1).max(32),
    description: z.string().optional(),
  });
  const data = schema.parse(input);
  const version = await CbcService.createCurriculumVersion(data);
  revalidatePath("/dashboard/curriculum");
  return version;
}

export async function createGradeLevelAction(input: {
  curriculumVersionId: string;
  name: string;
  code: string;
  orderIndex?: number;
}) {
  await requirePermission("curriculum:write");
  const version = await CbcService.createGradeLevel(input);
  revalidatePath("/dashboard/curriculum");
  return version;
}

export async function recordOutcomeAssessmentAction(input: {
  studentId: string;
  outcomeId: string;
  competencyLevelId: string;
  comments?: string;
  term?: string;
  year?: number;
}) {
  await requirePermission("grades:enter");
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  const schema = z.object({
    studentId: z.string().min(1),
    outcomeId: z.string().min(1),
    competencyLevelId: z.string().min(1),
    comments: z.string().optional(),
    term: z.string().optional(),
    year: z.number().int().optional(),
  });
  const data = schema.parse(input);

  const result = await CbcService.recordOutcomeAssessment({
    ...data,
    assessedById: user.id,
  });
  revalidatePath("/dashboard/grades");
  return result;
}

export async function addObservationAction(input: {
  studentId: string;
  notes: string;
  outcomeId?: string;
  competencyLevelId?: string;
  evidenceUrl?: string;
}) {
  await requirePermission("grades:enter");
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  if (!input.notes?.trim()) throw new Error("Notes are required");

  return CbcService.addObservation({
    ...input,
    notes: input.notes.trim(),
    observedById: user.id,
  });
}

export async function createInterventionAction(input: {
  studentId: string;
  title: string;
  description?: string;
}) {
  await requirePermission("grades:enter");
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  return CbcService.createIntervention({
    ...input,
    createdById: user.id,
  });
}

export async function addPortfolioItemAction(input: {
  studentId: string;
  title: string;
  description?: string;
  fileUrl?: string;
  itemType?: string;
  term?: string;
  year?: number;
}) {
  await requirePermission("grades:enter");
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  return CbcService.addPortfolioItem({
    ...input,
    createdById: user.id,
  });
}

export async function getQualitativeReportAction(
  studentId: string,
  term?: string,
  year?: number
) {
  await requirePermission("reports:read");
  if (!studentId) throw new Error("Student ID required");
  return CbcService.getQualitativeReport(studentId, term, year);
}

export async function createLearningAreaAction(input: {
  gradeLevelId: string;
  name: string;
  code?: string;
  description?: string;
}) {
  await requirePermission("curriculum:write");
  const schema = z.object({
    gradeLevelId: z.string().min(1),
    name: z.string().min(1),
    code: z.string().optional(),
    description: z.string().optional(),
  });
  const data = schema.parse(input);
  const area = await CbcService.createLearningArea(data);
  revalidatePath("/dashboard/curriculum");
  return area;
}

export async function createStrandAction(input: {
  learningAreaId: string;
  name: string;
  code?: string;
  description?: string;
  orderIndex?: number;
}) {
  await requirePermission("curriculum:write");
  const schema = z.object({
    learningAreaId: z.string().min(1),
    name: z.string().min(1),
    code: z.string().optional(),
    description: z.string().optional(),
    orderIndex: z.number().int().optional(),
  });
  const data = schema.parse(input);
  const strand = await CbcService.createStrand(data);
  revalidatePath("/dashboard/curriculum");
  return strand;
}

export async function createSubStrandAction(input: {
  strandId: string;
  name: string;
  code?: string;
  description?: string;
  orderIndex?: number;
}) {
  await requirePermission("curriculum:write");
  const schema = z.object({
    strandId: z.string().min(1),
    name: z.string().min(1),
    code: z.string().optional(),
    description: z.string().optional(),
    orderIndex: z.number().int().optional(),
  });
  const data = schema.parse(input);
  const sub = await CbcService.createSubStrand(data);
  revalidatePath("/dashboard/curriculum");
  return sub;
}

export async function createOutcomeAction(input: {
  subStrandId: string;
  description: string;
  code?: string;
  orderIndex?: number;
}) {
  await requirePermission("curriculum:write");
  const schema = z.object({
    subStrandId: z.string().min(1),
    description: z.string().min(1),
    code: z.string().optional(),
    orderIndex: z.number().int().optional(),
  });
  const data = schema.parse(input);
  const outcome = await CbcService.createOutcome(data);
  revalidatePath("/dashboard/curriculum");
  return outcome;
}

export async function getCompetencyLevelsAction() {
  await requirePermission("grades:read");
  const scale = await CbcService.getDefaultScale();
  return scale.levels;
}
