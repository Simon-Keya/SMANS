// tests/unit/notifications/notification.service.test.ts
import { prisma } from '@/lib/prisma';
import { NotificationService } from '@/lib/services/notification.service';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock Prisma
vi.mock('@/lib/prisma', () => ({
  prisma: {
    notification: {
      create: vi.fn(),
      update: vi.fn(),
      findMany: vi.fn(),
      count: vi.fn(),
    },
    user: {
      findUnique: vi.fn(),
    },
  },
}));

describe('NotificationService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('sendNotification', () => {
    it('creates a new notification in the database', async () => {
      const mockData = {
        userId: 'user-123',
        title: 'Fee Reminder',
        message: 'Your term fees are due in 3 days',
        type: 'INFO',
        channel: 'IN_APP',
      };

      (prisma.notification.create as any).mockResolvedValue({
        id: 'notif-001',
        ...mockData,
        createdAt: new Date(),
        read: false,
      });

      const result = await NotificationService.sendNotification(mockData);

      expect(prisma.notification.create).toHaveBeenCalledWith({
        data: expect.objectContaining(mockData),
      });

      expect(result).toMatchObject({
        id: 'notif-001',
        title: 'Fee Reminder',
        read: false,
      });
    });

    it('throws error when required fields are missing', async () => {
      await expect(
        NotificationService.sendNotification({
          userId: '',
          title: '',
          message: '',
        } as any)
      ).rejects.toThrow(/required/i);
    });
  });

  describe('markAsRead', () => {
    it('marks a single notification as read', async () => {
      (prisma.notification.update as any).mockResolvedValue({
        id: 'notif-001',
        read: true,
        readAt: expect.any(Date),
      });

      const result = await NotificationService.markAsRead('notif-001');

      expect(prisma.notification.update).toHaveBeenCalledWith({
        where: { id: 'notif-001' },
        data: {
          read: true,
          readAt: expect.any(Date),
        },
      });

      expect(result.read).toBe(true);
    });
  });

  describe('getUserNotifications', () => {
    it('returns paginated unread notifications for a user', async () => {
      (prisma.notification.findMany as any).mockResolvedValue([
        { id: 'n1', title: 'Test 1', read: false },
        { id: 'n2', title: 'Test 2', read: false },
      ]);

      (prisma.notification.count as any).mockResolvedValue(5);

      const result = await NotificationService.getUserNotifications('user-123', {
        unreadOnly: true,
        page: 1,
        limit: 10,
      });

      expect(result.notifications).toHaveLength(2);
      expect(result.total).toBe(5);
      expect(result.unreadCount).toBe(5);
    });
  });
});