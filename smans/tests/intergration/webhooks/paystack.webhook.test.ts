// tests/integration/webhooks/paystack.webhook.test.ts
import { POST } from '@/app/api/webhooks/paystack/route';
import { prisma } from '@/lib/prisma';

describe('Paystack Webhook Integration', () => {
  it('should process successful payment webhook', async () => {
    const webhookPayload = {
      event: 'charge.success',
      data: {
        reference: 'PAY_TEST_12345',
        amount: 12500,
        metadata: {
          invoiceId: 'inv-test-001',
          studentId: 'stud-001',
        },
      },
    };

    const request = new Request('http://localhost/api/webhooks/paystack', {
      method: 'POST',
      body: JSON.stringify(webhookPayload),
      headers: {
        'Content-Type': 'application/json',
        'x-paystack-signature': 'mock-signature', // In real test, verify signature
      },
    });

    const response = await POST(request);
    const result = await response.json();

    expect(response.status).toBe(200);
    expect(result.status).toBe('success');

    // Verify payment was recorded
    const payment = await prisma.payment.findFirst({
      where: { transactionRef: 'PAY_TEST_12345' },
    });
    expect(payment).toBeTruthy();
  });
});