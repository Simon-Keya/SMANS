// tests/unit/actions/notifications/sendNotification.test.ts
import { sendNotification } from '@/app/actions/notifications/sendNotification';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';

jest.mock('@/lib/prisma');
jest.mock('next-auth');

describe('sendNotification Action', () => {
  const mockAdminSession = {
    user: { id: 'admin-1', role: 'ADMIN' as const },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (getServerSession as jest.Mock).mockResolvedValue(mockAdminSession);
  });

  it('should successfully send notifications to valid users', async () => {
    const input = {
      userIds: ['user1', 'user2'],
      title: 'School Assembly',
      message: 'Tomorrow at 8:00 AM in the hall.',
    };

    (prisma.user.findMany as jest.Mock).mockResolvedValue([
      { id: 'user1' },
      { id: 'user2' },
    ]);

    (prisma.notification.createMany as jest.Mock).mockResolvedValue({ count: 2 });

    const result = await sendNotification(input);

    expect(result.success).toBe(true);
    expect(result.count).toBe(2);
    expect(prisma.notification.createMany).toHaveBeenCalled();
  });

  it('should throw error if user is not authorized (e.g. STUDENT)', async () => {
    (getServerSession as jest.Mock).mockResolvedValue({
      user: { id: 'stud-1', role: 'STUDENT' as const },
    });

    await expect(
      sendNotification({
        userIds: ['u1'],
        title: 'Test',
        message: 'Test msg',
      })
    ).rejects.toThrow('Unauthorized');
  });

  it('should validate required fields', async () => {
    await expect(
      sendNotification({
        userIds: [],
        title: '',
        message: '',
      })
    ).rejects.toThrow();
  });
});