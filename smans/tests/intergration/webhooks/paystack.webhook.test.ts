// tests/integration/webhooks/paystack.webhook.test.ts
import { POST } from '@/app/api/webhooks/paystack/route';
import { NextRequest } from 'next/server';

jest.mock('next-auth'); // if needed

describe('Paystack Webhook', () => {
  it('should process valid webhook', async () => {
    const payload = {
      event: 'charge.success',
      data: { /* your test payload */ },
    };

    const request = new NextRequest('http://localhost/api/webhooks/paystack', {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: { 
        'Content-Type': 'application/json',
        'x-paystack-signature': 'test-signature' 
      },
    });

    const response = await POST(request);
    const result = await response.json();

    expect(response.status).toBe(200);
  });
});