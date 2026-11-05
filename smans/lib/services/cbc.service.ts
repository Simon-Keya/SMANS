/**
 * CBC curriculum service — hierarchy, scales, assessments.
 * Competency levels are always loaded from DB (never hardcoded thresholds).
 */
import { prisma } from "@/lib/prisma";

const DEFAULT_SCALE_CODE = "KICD_4";

/** Fallback labels only used when DB has no scale — documented, not thresholds. */
export const FALLBACK_COMPETENCY_LEVELS = [
  { code: "EE", label: "Exceeding Expectations", orderIndex: 4 },
  { code: "ME", label: "Meeting Expectations", orderIndex: 3 },
  { code: "AE", label: "Approaching Expectations", orderIndex: 2 },
  { code: "BE", label: "Below Expectations", orderIndex: 1 },
] as const;

export class CbcService {
  /** Ensure default KICD 4-level scale exists; return it with levels. */
  static async ensureDefaultScale() {
    let scale = await prisma.competencyScale.findUnique({
      where: { code: DEFAULT_SCALE_CODE },
      include: { levels: { orderBy: { orderIndex: "desc" } } },
    });

    if (!scale) {
      scale = await prisma.competencyScale.create({
        data: {
          name: "KICD 4-level",
          code: DEFAULT_SCALE_CODE,
          description:
            "Kenya Institute of Curriculum Development four-level performance scale",
          isDefault: true,
          levels: {
            create: FALLBACK_COMPETENCY_LEVELS.map((l) => ({
              code: l.code,
              label: l.label,
              orderIndex: l.orderIndex,
            })),
          },
        },
        include: { levels: { orderBy: { orderIndex: "desc" } } },
      });
    }

    return scale;
  }

  static async getDefaultScale() {
    const scale = await prisma.competencyScale.findFirst({
      where: { isDefault: true },
      include: { levels: { orderBy: { orderIndex: "desc" } } },
    });
    if (scale) return scale;
    return this.ensureDefaultScale();
  }

  static async listCurriculumVersions() {
    return prisma.curriculumVersion.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        gradeLevels: {
          orderBy: { orderIndex: "asc" },
          include: {
            learningAreas: {
              include: {
                strands: {
                  include: {
                    subStrands: {
                      include: { outcomes: true },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });
  }

  static async createCurriculumVersion(data: {
    name: string;
    code: string;
    description?: string;
  }) {
    return prisma.curriculumVersion.create({
      data: {
        name: data.name.trim(),
        code: data.code.trim().toUpperCase(),
        description: data.description?.trim(),
        isActive: true,
      },
    });
  }

  static async createGradeLevel(data: {
    curriculumVersionId: string;
    name: string;
    code: string;
    orderIndex?: number;
  }) {
    return prisma.gradeLevel.create({
      data: {
        curriculumVersionId: data.curriculumVersionId,
        name: data.name.trim(),
        code: data.code.trim().toUpperCase(),
        orderIndex: data.orderIndex ?? 0,
      },
    });
  }

  static async createLearningArea(data: {
    gradeLevelId: string;
    name: string;
    code?: string;
    description?: string;
  }) {
    return prisma.cbcLearningArea.create({
      data: {
        gradeLevelId: data.gradeLevelId,
        name: data.name.trim(),
        code: data.code?.trim().toUpperCase(),
        description: data.description?.trim(),
      },
    });
  }

  static async createStrand(data: {
    learningAreaId: string;
    name: string;
    code?: string;
    description?: string;
    orderIndex?: number;
  }) {
    return prisma.strand.create({
      data: {
        learningAreaId: data.learningAreaId,
        name: data.name.trim(),
        code: data.code?.trim(),
        description: data.description?.trim(),
        orderIndex: data.orderIndex ?? 0,
      },
    });
  }

  static async createSubStrand(data: {
    strandId: string;
    name: string;
    code?: string;
    description?: string;
    orderIndex?: number;
  }) {
    return prisma.subStrand.create({
      data: {
        strandId: data.strandId,
        name: data.name.trim(),
        code: data.code?.trim(),
        description: data.description?.trim(),
        orderIndex: data.orderIndex ?? 0,
      },
    });
  }

  static async createOutcome(data: {
    subStrandId: string;
    description: string;
    code?: string;
    orderIndex?: number;
  }) {
    return prisma.outcome.create({
      data: {
        subStrandId: data.subStrandId,
        description: data.description.trim(),
        code: data.code?.trim(),
        orderIndex: data.orderIndex ?? 0,
      },
    });
  }

  static async recordOutcomeAssessment(data: {
    studentId: string;
    outcomeId: string;
    competencyLevelId: string;
    assessedById: string;
    comments?: string;
    term?: string;
    year?: number;
  }) {
    return prisma.outcomeAssessment.upsert({
      where: {
        studentId_outcomeId_term_year: {
          studentId: data.studentId,
          outcomeId: data.outcomeId,
          term: data.term ?? null,
          year: data.year ?? null,
        },
      },
      create: {
        studentId: data.studentId,
        outcomeId: data.outcomeId,
        competencyLevelId: data.competencyLevelId,
        assessedById: data.assessedById,
        comments: data.comments,
        term: data.term,
        year: data.year,
      },
      update: {
        competencyLevelId: data.competencyLevelId,
        comments: data.comments,
        assessedById: data.assessedById,
        assessedAt: new Date(),
      },
    });
  }

  static async addObservation(data: {
    studentId: string;
    notes: string;
    observedById: string;
    outcomeId?: string;
    competencyLevelId?: string;
    evidenceUrl?: string;
  }) {
    return prisma.observation.create({
      data: {
        studentId: data.studentId,
        notes: data.notes.trim(),
        observedById: data.observedById,
        outcomeId: data.outcomeId,
        competencyLevelId: data.competencyLevelId,
        evidenceUrl: data.evidenceUrl,
      },
    });
  }

  static async createIntervention(data: {
    studentId: string;
    title: string;
    description?: string;
    createdById: string;
  }) {
    return prisma.intervention.create({
      data: {
        studentId: data.studentId,
        title: data.title.trim(),
        description: data.description?.trim(),
        createdById: data.createdById,
      },
    });
  }

  static async addPortfolioItem(data: {
    studentId: string;
    title: string;
    description?: string;
    fileUrl?: string;
    itemType?: string;
    term?: string;
    year?: number;
    createdById?: string;
  }) {
    return prisma.portfolioItem.create({
      data: {
        studentId: data.studentId,
        title: data.title.trim(),
        description: data.description?.trim(),
        fileUrl: data.fileUrl,
        itemType: data.itemType ?? "EVIDENCE",
        term: data.term,
        year: data.year,
        createdById: data.createdById,
      },
    });
  }

  /** Qualitative report card data for a student in a term/year */
  static async getQualitativeReport(studentId: string, term?: string, year?: number) {
    const assessments = await prisma.outcomeAssessment.findMany({
      where: {
        studentId,
        ...(term ? { term } : {}),
        ...(year ? { year } : {}),
      },
      include: {
        outcome: {
          include: {
            subStrand: {
              include: {
                strand: {
                  include: {
                    learningArea: true,
                  },
                },
              },
            },
          },
        },
        competencyLevel: true,
      },
      orderBy: { assessedAt: "desc" },
    });

    const observations = await prisma.observation.findMany({
      where: { studentId },
      orderBy: { observedAt: "desc" },
      take: 20,
    });

    const interventions = await prisma.intervention.findMany({
      where: { studentId, status: { not: "CLOSED" } },
      orderBy: { startedAt: "desc" },
    });

    const portfolio = await prisma.portfolioItem.findMany({
      where: {
        studentId,
        ...(term ? { term } : {}),
        ...(year ? { year } : {}),
      },
      orderBy: { createdAt: "desc" },
    });

    return { assessments, observations, interventions, portfolio };
  }
}
