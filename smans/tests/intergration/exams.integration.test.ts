import { app } from "@/app"; // Adjust if your app is exported differently
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import request from "supertest";

describe("Exams Integration", () => {
  let teacherToken: string;
  let classId: string;

  beforeAll(async () => {
    // Create test teacher
    const hashed = await bcrypt.hash("teacher123", 10);
    const teacher = await prisma.user.create({
      data: {
        email: "teacher.exam@test.com",
        password: hashed,
        role: "TEACHER",
        name: "Test Teacher",
      },
    });

    // Create test class
    const cls = await prisma.class.create({
      data: {
        name: "Test Class",
        level: "Form 1",
        teacherId: teacher.id,
      },
    });
    classId = cls.id;

    // Login as teacher
    const loginRes = await request(app)
      .post("/api/auth/login")
      .send({
        email: "teacher.exam@test.com",
        password: "teacher123",
      });

    teacherToken = loginRes.body.token;
  });

  afterAll(async () => {
    await prisma.$transaction([
      prisma.exam.deleteMany(),
      prisma.class.deleteMany(),
      prisma.user.deleteMany({ where: { email: "teacher.exam@test.com" } }),
    ]);
  });

  it("should allow teacher to create an exam", async () => {
    const res = await request(app)
      .post("/api/exams/create")
      .set("Authorization", `Bearer ${teacherToken}`)
      .send({
        name: "Mid-Term Exam",
        term: "Term 1",
        date: new Date("2025-06-15").toISOString(),
        classId,
      });

    expect(res.status).toBe(201);
    expect(res.body.name).toBe("Mid-Term Exam");
    expect(res.body.classId).toBe(classId);
  });

  it("should reject non-teacher from creating exam", async () => {
    const res = await request(app)
      .post("/api/exams/create")
      .send({
        name: "Invalid",
        term: "Term 2",
        date: new Date().toISOString(),
        classId,
      });

    expect(res.status).toBe(401); // or 403 depending on auth middleware
  });

  it("should allow teacher to record results", async () => {
    // First create an exam
    const examRes = await request(app)
      .post("/api/exams/create")
      .set("Authorization", `Bearer ${teacherToken}`)
      .send({
        name: "Results Test",
        date: new Date().toISOString(),
        classId,
      });

    const examId = examRes.body.id;

    // Record results
    const res = await request(app)
      .post("/api/exams/record-results")
      .set("Authorization", `Bearer ${teacherToken}`)
      .send({
        examId,
        results: [
          {
            studentId: "stu_test_123",
            subjectId: "sub_math",
            marks: 85,
            maxMarks: 100,
          },
        ],
      });

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
  });
});