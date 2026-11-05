-- CBC curriculum hierarchy and assessment support (additive)

CREATE TABLE IF NOT EXISTS "curriculum_versions" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "effectiveFrom" TIMESTAMP(3),
    "effectiveTo" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "curriculum_versions_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "curriculum_versions_code_key" ON "curriculum_versions"("code");

CREATE TABLE IF NOT EXISTS "grade_levels" (
    "id" TEXT NOT NULL,
    "curriculumVersionId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "orderIndex" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "grade_levels_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "grade_levels_curriculumVersionId_code_key" ON "grade_levels"("curriculumVersionId", "code");
CREATE INDEX IF NOT EXISTS "grade_levels_curriculumVersionId_idx" ON "grade_levels"("curriculumVersionId");

CREATE TABLE IF NOT EXISTS "cbc_learning_areas" (
    "id" TEXT NOT NULL,
    "gradeLevelId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "cbc_learning_areas_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "cbc_learning_areas_gradeLevelId_code_key" ON "cbc_learning_areas"("gradeLevelId", "code");
CREATE INDEX IF NOT EXISTS "cbc_learning_areas_gradeLevelId_idx" ON "cbc_learning_areas"("gradeLevelId");

CREATE TABLE IF NOT EXISTS "strands" (
    "id" TEXT NOT NULL,
    "learningAreaId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "description" TEXT,
    "orderIndex" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "strands_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "strands_learningAreaId_idx" ON "strands"("learningAreaId");

CREATE TABLE IF NOT EXISTS "sub_strands" (
    "id" TEXT NOT NULL,
    "strandId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "description" TEXT,
    "orderIndex" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "sub_strands_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "sub_strands_strandId_idx" ON "sub_strands"("strandId");

CREATE TABLE IF NOT EXISTS "outcomes" (
    "id" TEXT NOT NULL,
    "subStrandId" TEXT NOT NULL,
    "code" TEXT,
    "description" TEXT NOT NULL,
    "orderIndex" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "outcomes_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "outcomes_subStrandId_idx" ON "outcomes"("subStrandId");

CREATE TABLE IF NOT EXISTS "competency_scales" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "competency_scales_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "competency_scales_code_key" ON "competency_scales"("code");

CREATE TABLE IF NOT EXISTS "competency_levels" (
    "id" TEXT NOT NULL,
    "scaleId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "description" TEXT,
    "orderIndex" INTEGER NOT NULL DEFAULT 0,
    "minScore" DECIMAL(5,2),
    "maxScore" DECIMAL(5,2),
    "color" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "competency_levels_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "competency_levels_scaleId_code_key" ON "competency_levels"("scaleId", "code");
CREATE INDEX IF NOT EXISTS "competency_levels_scaleId_idx" ON "competency_levels"("scaleId");

CREATE TABLE IF NOT EXISTS "core_competencies" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "orderIndex" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "core_competencies_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "core_competencies_code_key" ON "core_competencies"("code");

CREATE TABLE IF NOT EXISTS "core_values" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "orderIndex" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "core_values_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "core_values_code_key" ON "core_values"("code");

CREATE TABLE IF NOT EXISTS "pcis" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT,
    "orderIndex" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "pcis_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "pcis_code_key" ON "pcis"("code");

CREATE TABLE IF NOT EXISTS "rubric_levels" (
    "id" TEXT NOT NULL,
    "outcomeId" TEXT NOT NULL,
    "competencyLevelId" TEXT NOT NULL,
    "descriptor" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "rubric_levels_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "rubric_levels_outcomeId_competencyLevelId_key" ON "rubric_levels"("outcomeId", "competencyLevelId");
CREATE INDEX IF NOT EXISTS "rubric_levels_outcomeId_idx" ON "rubric_levels"("outcomeId");

CREATE TABLE IF NOT EXISTS "observations" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "outcomeId" TEXT,
    "competencyLevelId" TEXT,
    "observedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT NOT NULL,
    "evidenceUrl" TEXT,
    "observedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "observations_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "observations_studentId_idx" ON "observations"("studentId");
CREATE INDEX IF NOT EXISTS "observations_outcomeId_idx" ON "observations"("outcomeId");
CREATE INDEX IF NOT EXISTS "observations_observedById_idx" ON "observations"("observedById");

CREATE TABLE IF NOT EXISTS "interventions" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "closedAt" TIMESTAMP(3),
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "interventions_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "interventions_studentId_idx" ON "interventions"("studentId");
CREATE INDEX IF NOT EXISTS "interventions_status_idx" ON "interventions"("status");

CREATE TABLE IF NOT EXISTS "portfolio_items" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "fileUrl" TEXT,
    "itemType" TEXT NOT NULL DEFAULT 'EVIDENCE',
    "term" TEXT,
    "year" INTEGER,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "portfolio_items_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "portfolio_items_studentId_idx" ON "portfolio_items"("studentId");

CREATE TABLE IF NOT EXISTS "outcome_assessments" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "outcomeId" TEXT NOT NULL,
    "competencyLevelId" TEXT NOT NULL,
    "assessedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "comments" TEXT,
    "assessedById" TEXT NOT NULL,
    "term" TEXT,
    "year" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "outcome_assessments_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "outcome_assessments_studentId_idx" ON "outcome_assessments"("studentId");
CREATE INDEX IF NOT EXISTS "outcome_assessments_outcomeId_idx" ON "outcome_assessments"("outcomeId");
CREATE UNIQUE INDEX IF NOT EXISTS "outcome_assessments_studentId_outcomeId_term_year_key" ON "outcome_assessments"("studentId", "outcomeId", "term", "year");

-- FKs
ALTER TABLE "grade_levels" ADD CONSTRAINT "grade_levels_curriculumVersionId_fkey" FOREIGN KEY ("curriculumVersionId") REFERENCES "curriculum_versions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "cbc_learning_areas" ADD CONSTRAINT "cbc_learning_areas_gradeLevelId_fkey" FOREIGN KEY ("gradeLevelId") REFERENCES "grade_levels"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "strands" ADD CONSTRAINT "strands_learningAreaId_fkey" FOREIGN KEY ("learningAreaId") REFERENCES "cbc_learning_areas"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "sub_strands" ADD CONSTRAINT "sub_strands_strandId_fkey" FOREIGN KEY ("strandId") REFERENCES "strands"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "outcomes" ADD CONSTRAINT "outcomes_subStrandId_fkey" FOREIGN KEY ("subStrandId") REFERENCES "sub_strands"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "competency_levels" ADD CONSTRAINT "competency_levels_scaleId_fkey" FOREIGN KEY ("scaleId") REFERENCES "competency_scales"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "rubric_levels" ADD CONSTRAINT "rubric_levels_outcomeId_fkey" FOREIGN KEY ("outcomeId") REFERENCES "outcomes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "rubric_levels" ADD CONSTRAINT "rubric_levels_competencyLevelId_fkey" FOREIGN KEY ("competencyLevelId") REFERENCES "competency_levels"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "observations" ADD CONSTRAINT "observations_outcomeId_fkey" FOREIGN KEY ("outcomeId") REFERENCES "outcomes"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "observations" ADD CONSTRAINT "observations_competencyLevelId_fkey" FOREIGN KEY ("competencyLevelId") REFERENCES "competency_levels"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "outcome_assessments" ADD CONSTRAINT "outcome_assessments_outcomeId_fkey" FOREIGN KEY ("outcomeId") REFERENCES "outcomes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "outcome_assessments" ADD CONSTRAINT "outcome_assessments_competencyLevelId_fkey" FOREIGN KEY ("competencyLevelId") REFERENCES "competency_levels"("id") ON DELETE CASCADE ON UPDATE CASCADE;
