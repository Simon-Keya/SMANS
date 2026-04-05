// tests/integration/api/notifications.api.test.ts
import { POST } from '@/app/api/notifications/route';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { NextRequest } from 'next/server'; // ← Important

jest.mock('next-auth');

describe('Notifications API Integration', () => {
  beforeEach(async () => {
    await prisma.notification.deleteMany({});
  });

  it('should send notifications to multiple users', async () => {
    const mockSession = { user: { id: 'admin-1', role: 'ADMIN' } };
    (getServerSession as jest.Mock).mockResolvedValue(mockSession);

    await prisma.user.createMany({
      data: [
        { id: 'u1', email: 'u1@test.com', role: 'PARENT', name: 'Parent One' },
        { id: 'u2', email: 'u2@test.com', role: 'PARENT', name: 'Parent Two' },
      ],
      skipDuplicates: true,
    });

    const payload = {
      title: 'Parent-Teacher Meeting',
      message: 'Scheduled for Friday at 2:00 PM',
      recipientIds: ['u1', 'u2'],
    };

    const request = new NextRequest('http://localhost/api/notifications', {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await POST(request);
    const result = await response.json();

    expect(response.status).toBe(201);
    expect(result.success).toBe(true);
    expect(result.data).toHaveLength(2);
  });

  it('should return 401 for non-admin users', async () => {
    const mockSession = { user: { id: 'teacher-1', role: 'TEACHER' } };
    (getServerSession as jest.Mock).mockResolvedValue(mockSession);

    const payload = {
      title: 'Test',
      message: 'This is a test message',
    };

    const request = new NextRequest('http://localhost/api/notifications', {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await POST(request);

    expect(response.status).toBe(401);
  });
});