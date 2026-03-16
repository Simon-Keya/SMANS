// tests/integration/notifications/notifications.api.test.ts
import { GET } from '@/app/api/notifications/route'; // adjust path if different
import { prisma } from '@/lib/prisma';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

describe('Notifications API', () => {
  beforeAll(async () => {
    // Seed test data
    await prisma.user.create({
      data: {
        id: 'test-user-1',
        email: 'test@example.com',
        role: 'PARENT',
      },
    });

    await prisma.notification.createMany({
      data: [
        {
          userId: 'test-user-1',
          title: 'Test Notif 1',
          message: 'Hello',
          type: 'INFO',
          read: false,
        },
        {
          userId: 'test-user-1',
          title: 'Test Notif 2',
          message: 'World',
          type: 'INFO',
          read: true,
        },
      ],
    });
  });

  afterAll(async () => {
    await prisma.notification.deleteMany({ where: { userId: 'test-user-1' } });
    await prisma.user.delete({ where: { id: 'test-user-1' } });
  });

  it('GET /api/notifications returns user notifications', async () => {
    const req = new Request('http://localhost/api/notifications', {
      headers: {
        // Mock authenticated user (you may need to mock session)
        cookie: 'next-auth.session-token=valid-token',
      },
    });

    const res = await GET(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.notifications).toBeDefined();
    expect(json.notifications.length).toBeGreaterThanOrEqual(1);
  });
});