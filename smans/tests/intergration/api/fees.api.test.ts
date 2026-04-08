// tests/integration/api/fees.api.test.ts
import { POST as recordPayment } from '@/app/api/fees/payments/route';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { NextRequest } from 'next/server';

jest.mock('next-auth');

describe('Fees & Payments API Integration', () => {
  beforeEach(async () => {
    await prisma.payment.deleteMany({});
    await prisma.invoice.deleteMany({});
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('should record a payment and update invoice status', async () => {
    const mockSession = { user: { id: 'acc-1', role: 'ACCOUNTANT' } };
    (getServerSession as jest.Mock).mockResolvedValue(mockSession);

    // Create a test invoice first
    const invoice = await prisma.invoice.create({
      data: {
        studentId: 'stud-test',
        amount: 12500,
        status: 'PENDING',
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    const paymentData = {
      invoiceId: invoice.id,
      amount: 12500,
      method: 'MPESA',
      paymentDate: new Date().toISOString(),
    };

    // Use NextRequest (required by your route)
    const request = new NextRequest('http://localhost/api/payments', {
      method: 'POST',
      body: JSON.stringify(paymentData),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await recordPayment(request);
    const result = await response.json();

    expect(response.status).toBe(201);
    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();

    // Verify payment was created
    const payment = await prisma.payment.findFirst({
      where: { invoiceId: invoice.id },
    });

    expect(payment).toBeTruthy();
    expect(payment?.amount).toBe(12500);
    expect(payment?.status).toBe('COMPLETED');

    // Verify invoice status was updated
    const updatedInvoice = await prisma.invoice.findUnique({
      where: { id: invoice.id },
    });

    expect(updatedInvoice?.status).toBe('PAID');
  });

  it('should return 401 for non-accountant/admin users', async () => {
    const mockSession = { user: { id: 'teacher-1', role: 'TEACHER' } };
    (getServerSession as jest.Mock).mockResolvedValue(mockSession);

    const request = new NextRequest('http://localhost/api/payments', {
      method: 'POST',
      body: JSON.stringify({
        invoiceId: 'fake-id',
        amount: 5000,
        method: 'CASH',
      }),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await recordPayment(request);

    expect(response.status).toBe(401);
  });
});