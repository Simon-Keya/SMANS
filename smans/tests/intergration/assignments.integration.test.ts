import { app } from "@/app"; // Export your Next.js app or use supertest on the server
import { prisma } from "@/lib/prisma";
import request from "supertest";

describe("Assignments Integration", () => {
  let teacherToken: string;

  beforeAll(async () => {
    // Create a test teacher and login
    const teacher = await prisma.user.create({
      data: {
        email: "teacher@test.com",
        password: await bcrypt.hash("test123", 10),
        role: "TEACHER",
        name: "Test Teacher",
      },
    });

    const loginRes = await request(app)
      .post("/api/auth/login")
      .send({
        email: "teacher@test.com",
        password: "test123",
      });

    teacherToken = loginRes.body.token;
  });

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { email: "teacher@test.com" } });
  });

  it("should allow teacher to create assignment", async () => {
    const res = await request(app)
      .post("/api/assignments/create")
      .set("Authorization", `Bearer ${teacherToken}`)
      .send({
        title: "Math Homework 1",
        description: "Solve exercises 1-10",
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        classId: "cls_test_123",
        subjectId: "sub_math",
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("id");
    expect(res.body.title).toBe("Math Homework 1");
  });

  it("should reject non-teacher from creating assignment", async () => {
    const res = await request(app)
      .post("/api/assignments/create")
      .send({
        title: "Invalid",
        description: "Test",
        dueDate: new Date().toISOString(),
        classId: "cls_test",
        subjectId: "sub_test",
      });

    expect(res.status).toBe(401); // or 403 depending on middleware
  });
});