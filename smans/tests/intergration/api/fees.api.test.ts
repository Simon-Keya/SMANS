// tests/integration/api/fees.api.test.ts
import { POST } from '@/app/api/fees/record/route'; // Adjust if your route path differs
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';

jest.mock('next-auth');

describe('Fees API Integration', () => {
  beforeEach(async () => {
    await prisma.payment.deleteMany({});
    await prisma.invoice.deleteMany({});
  });

  it('should record a payment and update invoice', async () => {
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
      paymentMethod: 'MPESA',
      transactionRef: 'MPESA_TEST_98765',
    };

    const request = new Request('http://localhost/api/fees/record', {
      method: 'POST',
      body: JSON.stringify(paymentData),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await POST(request);
    const result = await response.json();

    expect(response.status).toBe(200);
    expect(result.success).toBe(true);

    // Verify payment was created
    const payment = await prisma.payment.findFirst({
      where: { invoiceId: invoice.id },
    });
    expect(payment).toBeTruthy();
    expect(payment?.amount).toBe(12500);
  });
});