import { testApiHandler } from "next-test-api-route-handler";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

// Import the actual route handler file
import * as handler from "@/app/api/assignments/create/route"; // adjust path

describe("Assignments Integration", () => {
  let teacherToken: string;

  beforeAll(async () => {
    const hashed = await bcrypt.hash("teacher123", 10);
    await prisma.user.create({
      data: {
        email: "teacher@test.com",
        password: hashed,
        role: "TEACHER",
        name: "Test Teacher",
      },
    });

    // In real test: call login endpoint to get real token
    teacherToken = "mock-jwt-for-testing";
  });

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { email: "teacher@test.com" } });
  });

  it("should allow teacher to create assignment", async () => {
    await testApiHandler({
      handler,
      test: async ({ fetch }) => {
        const res = await fetch({
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${teacherToken}`,
          },
          body: JSON.stringify({
            title: "Math Homework 1",
            description: "Solve exercises 1-10",
            dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            classId: "cls_test_123",
            subjectId: "sub_math",
          }),
        });

        expect(res.status).toBe(201);
        const json = await res.json();
        expect(json).toHaveProperty("id");
        expect(json.title).toBe("Math Homework 1");
      },
    });
  });
});