import { prisma } from "@/lib/prisma";
import "@testing-library/jest-dom";

// Clean DB before each test suite
beforeAll(async () => {
  await prisma.$connect();
});

afterAll(async () => {
  await prisma.$disconnect();
});

afterEach(async () => {
  // Clear all tables (adjust as needed)
  await prisma.$transaction([
    prisma.attendance.deleteMany(),
    prisma.grade.deleteMany(),
    prisma.exam.deleteMany(),
    prisma.student.deleteMany(),
    prisma.parent.deleteMany(),
    prisma.user.deleteMany(),
    // add other models
  ]);
});