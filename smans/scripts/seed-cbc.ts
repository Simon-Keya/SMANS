/**
 * Seed default CBC competency scale, core competencies, values, PCIs,
 * and a sample curriculum version hierarchy.
 * Run: npx ts-node scripts/seed-cbc.ts
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const scale = await prisma.competencyScale.upsert({
    where: { code: "KICD_4" },
    update: {},
    create: {
      name: "KICD 4-level",
      code: "KICD_4",
      description: "Kenya Institute of Curriculum Development four-level scale",
      isDefault: true,
      levels: {
        create: [
          { code: "EE", label: "Exceeding Expectations", orderIndex: 4 },
          { code: "ME", label: "Meeting Expectations", orderIndex: 3 },
          { code: "AE", label: "Approaching Expectations", orderIndex: 2 },
          { code: "BE", label: "Below Expectations", orderIndex: 1 },
        ],
      },
    },
  });
  console.log("Scale:", scale.code);

  const competencies = [
    { code: "CC1", name: "Communication and Collaboration" },
    { code: "CC2", name: "Critical Thinking and Problem Solving" },
    { code: "CC3", name: "Creativity and Imagination" },
    { code: "CC4", name: "Citizenship" },
    { code: "CC5", name: "Digital Literacy" },
    { code: "CC6", name: "Learning to Learn" },
    { code: "CC7", name: "Self-efficacy" },
  ];
  for (const [i, c] of competencies.entries()) {
    await prisma.coreCompetency.upsert({
      where: { code: c.code },
      update: { name: c.name },
      create: { ...c, orderIndex: i + 1 },
    });
  }

  const values = [
    { code: "V1", name: "Love" },
    { code: "V2", name: "Responsibility" },
    { code: "V3", name: "Respect" },
    { code: "V4", name: "Unity" },
    { code: "V5", name: "Peace" },
    { code: "V6", name: "Patriotism" },
    { code: "V7", name: "Integrity" },
  ];
  for (const [i, v] of values.entries()) {
    await prisma.coreValue.upsert({
      where: { code: v.code },
      update: { name: v.name },
      create: { ...v, orderIndex: i + 1 },
    });
  }

  const pcis = [
    { code: "PCI1", name: "Health Education", category: "Health" },
    { code: "PCI2", name: "Life Skills", category: "Life Skills" },
    { code: "PCI3", name: "Environmental Education", category: "Environment" },
  ];
  for (const [i, p] of pcis.entries()) {
    await prisma.pci.upsert({
      where: { code: p.code },
      update: { name: p.name },
      create: { ...p, orderIndex: i + 1 },
    });
  }

  let version = await prisma.curriculumVersion.findUnique({
    where: { code: "CBC2024" },
  });
  if (!version) {
    version = await prisma.curriculumVersion.create({
      data: {
        name: "CBC 2024 Sample",
        code: "CBC2024",
        description: "Sample hierarchy for development",
        isActive: true,
      },
    });
  }

  let grade = await prisma.gradeLevel.findFirst({
    where: { curriculumVersionId: version.id, code: "G4" },
  });
  if (!grade) {
    grade = await prisma.gradeLevel.create({
      data: {
        curriculumVersionId: version.id,
        name: "Grade 4",
        code: "G4",
        orderIndex: 4,
      },
    });
  }

  let area = await prisma.cbcLearningArea.findFirst({
    where: { gradeLevelId: grade.id, code: "MATH" },
  });
  if (!area) {
    area = await prisma.cbcLearningArea.create({
      data: {
        gradeLevelId: grade.id,
        name: "Mathematics",
        code: "MATH",
      },
    });
  }

  let strand = await prisma.strand.findFirst({
    where: { learningAreaId: area.id, name: "Numbers" },
  });
  if (!strand) {
    strand = await prisma.strand.create({
      data: {
        learningAreaId: area.id,
        name: "Numbers",
        code: "NUM",
        orderIndex: 1,
      },
    });
  }

  let sub = await prisma.subStrand.findFirst({
    where: { strandId: strand.id, name: "Whole numbers" },
  });
  if (!sub) {
    sub = await prisma.subStrand.create({
      data: {
        strandId: strand.id,
        name: "Whole numbers",
        code: "WN",
        orderIndex: 1,
      },
    });
  }

  const existingOutcome = await prisma.outcome.findFirst({
    where: { subStrandId: sub.id },
  });
  if (!existingOutcome) {
    await prisma.outcome.create({
      data: {
        subStrandId: sub.id,
        code: "G4.MATH.NUM.1",
        description:
          "Learner is able to count, read, and write whole numbers up to 10,000",
        orderIndex: 1,
      },
    });
  }

  console.log("CBC seed complete");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
