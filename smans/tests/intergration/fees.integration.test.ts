import { app } from "@/app";
import { prisma } from "@/lib/prisma";
import request from "supertest";

describe("Fees Integration", () => {
  let adminToken: string;

  beforeAll(async () => {
    // Create admin and login
    const admin = await prisma.user.create({
      data: {
        email: "admin@test.com",
        password: await bcrypt.hash("admin123", 10),
        role: "ADMIN",
        name: "Test Admin",
      },
    });

    const loginRes = await request(app)
      .post("/api/auth/login")
      .send({
        email: "admin@test.com",
        password: "admin123",
      });

    adminToken = loginRes.body.token;
  });

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { email: "admin@test.com" } });
  });

  it("should allow admin to create fee item", async () => {
    const res = await request(app)
      .post("/api/fees/create-fee-item")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        name: "Term 1 Tuition",
        amount: 25000,
        frequency: "termly",
        description: "Annual term fee",
      });

    expect(res.status).toBe(201);
    expect(res.body.amount).toBe(25000);
    expect(res.body.name).toBe("Term 1 Tuition");
  });

  it("should generate invoice for student", async () => {
    // Assume a student exists
    const student = await prisma.student.create({
      data: {
        name: "Test Student",
        rollNumber: "STU999",
        classId: "cls_test",
      },
    });

    const res = await request(app)
      .post("/api/fees/generate-invoice")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        studentId: student.id,
        feeItemIds: ["fee_test_123"], // assume exists
      });

    expect(res.status).toBe(201);
    expect(res.body.studentId).toBe(student.id);
    expect(res.body.amount).toBeGreaterThan(0);
  });
});