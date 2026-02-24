import { app } from "@/app";
import { prisma } from "@/lib/prisma";
import request from "supertest";

describe("Payments Integration", () => {
  let adminToken: string;
  let invoiceId: string;

  beforeAll(async () => {
    const admin = await prisma.user.create({
      data: {
        email: "admin2@test.com",
        password: await bcrypt.hash("admin123", 10),
        role: "ADMIN",
      },
    });

    const loginRes = await request(app)
      .post("/api/auth/login")
      .send({
        email: "admin2@test.com",
        password: "admin123",
      });

    adminToken = loginRes.body.token;

    // Create test invoice
    const invoice = await prisma.invoice.create({
      data: {
        studentId: "stu_test_123",
        amount: 15000,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        status: "PENDING",
      },
    });

    invoiceId = invoice.id;
  });

  afterAll(async () => {
    await prisma.invoice.deleteMany();
    await prisma.user.deleteMany({ where: { email: "admin2@test.com" } });
  });

  it("should record payment and update invoice status", async () => {
    const res = await request(app)
      .post("/api/payments/record")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        invoiceId,
        amount: 15000,
        method: "mpesa",
      });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("COMPLETED");

    const updatedInvoice = await prisma.invoice.findUnique({ where: { id: invoiceId } });
    expect(updatedInvoice?.status).toBe("PAID");
  });

  it("should allow partial payment", async () => {
    const partialInvoice = await prisma.invoice.create({
      data: {
        studentId: "stu_test_123",
        amount: 20000,
        dueDate: new Date(),
        status: "PENDING",
      },
    });

    const res = await request(app)
      .post("/api/payments/record")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        invoiceId: partialInvoice.id,
        amount: 8000,
        method: "cash",
      });

    expect(res.status).toBe(200);

    const updated = await prisma.invoice.findUnique({ where: { id: partialInvoice.id } });
    expect(updated?.status).toBe("PARTIAL");
  });
});