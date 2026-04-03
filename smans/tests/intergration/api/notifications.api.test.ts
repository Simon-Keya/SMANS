// tests/integration/api/notifications.api.test.ts
import { POST } from '@/app/api/notifications/send/route';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';

jest.mock('next-auth');

describe('Notifications API Integration', () => {
  beforeEach(async () => {
    await prisma.notification.deleteMany({});
  });

  it('should send notifications to multiple users', async () => {
    const mockSession = { user: { id: 'admin-1', role: 'ADMIN' } };
    (getServerSession as jest.Mock).mockResolvedValue(mockSession);

    // Create test users
    await prisma.user.createMany({
      data: [
        { id: 'u1', email: 'u1@test.com', role: 'PARENT' },
        { id: 'u2', email: 'u2@test.com', role: 'PARENT' },
      ],
      skipDuplicates: true,
    });

    const payload = {
      userIds: ['u1', 'u2'],
      title: 'Parent-Teacher Meeting',
      message: 'Scheduled for Friday at 2:00 PM',
    };

    const request = new Request('http://localhost/api/notifications/send', {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await POST(request);
    const result = await response.json();

    expect(response.status).toBe(200);
    expect(result.success).toBe(true);
    expect(result.count).toBeGreaterThan(0);
  });
});