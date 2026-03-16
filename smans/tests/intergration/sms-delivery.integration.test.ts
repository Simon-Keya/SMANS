// tests/integration/notifications/sms-delivery.integration.test.ts
import { sendBulkSMS } from '@/app/actions/notifications/sendBulkSMS'; // adjust path if needed
import { prisma } from '@/lib/prisma';
import { smsProvider } from '@/lib/services/sms'; // your provider export
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

// Mock the actual SMS provider to avoid real API calls in tests
vi.mock('@/lib/services/sms', () => ({
  smsProvider: {
    sendSMS: vi.fn(),
    sendBulkSMS: vi.fn(),
  },
}));

describe('SMS Delivery Integration', () => {
  // Sample test data
  const testUserId = 'test-user-123';
  const testRecipients = [
    { phone: '+254712345678', userId: testUserId, name: 'John Doe' },
    { phone: '+254723456789', userId: testUserId, name: 'Jane Smith' },
  ];

  const testMessage = 'Urgent: School fees payment due tomorrow. Please settle to avoid penalties.';

  beforeAll(async () => {
    // Make sure test user exists
    await prisma.user.upsert({
      where: { id: testUserId },
      update: {},
      create: {
        id: testUserId,
        email: 'test-sms@example.com',
        name: 'Test User',
        role: 'PARENT',
      },
    });
  });

  afterAll(async () => {
    // Clean up test notifications
    await prisma.notification.deleteMany({
      where: { userId: testUserId },
    });
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('successfully sends bulk SMS and creates in-app notifications', async () => {
    // Mock successful SMS delivery
    vi.mocked(smsProvider.sendBulkSMS).mockResolvedValue({
      successCount: 2,
      failed: [],
    });

    const result = await sendBulkSMS({
      recipients: testRecipients,
      message: testMessage,
      senderId: 'SMANS',
      type: 'FEE_REMINDER',
    });

    // Check action result
    expect(result.success).toBe(true);
    expect(result.successCount).toBe(2);
    expect(result.failed).toEqual([]);

    // Verify SMS provider was called correctly
    expect(smsProvider.sendBulkSMS).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ phone: '+254712345678' }),
        expect.objectContaining({ phone: '+254723456789' }),
      ]),
      testMessage,
      expect.any(Object) // options like senderId
    );

    // Check database: notifications should exist
    const notifications = await prisma.notification.findMany({
      where: {
        userId: testUserId,
        title: { contains: 'Fee Reminder' },
      },
    });

    expect(notifications.length).toBe(2);
    expect(notifications[0].message).toContain('School fees payment due');
    expect(notifications[0].type).toBe('FEE_REMINDER');
    expect(notifications[0].channel).toBe('SMS');
    expect(notifications[0].read).toBe(false);
  });

  it('handles partial SMS failure and still creates successful notifications', async () => {
    // Mock: first succeeds, second fails
    vi.mocked(smsProvider.sendBulkSMS).mockResolvedValue({
      successCount: 1,
      failed: ['+254723456789'],
    });

    const result = await sendBulkSMS({
      recipients: testRecipients,
      message: testMessage,
      senderId: 'SMANS',
      type: 'EXAM_RESULT',
    });

    expect(result.success).toBe(true);
    expect(result.successCount).toBe(1);
    expect(result.failed).toEqual(['+254723456789']);

    // Only one notification should be created (for successful send)
    const notifications = await prisma.notification.findMany({
      where: { userId: testUserId, type: 'EXAM_RESULT' },
    });

    expect(notifications.length).toBe(1);
    expect(notifications[0].message).toContain('School fees payment due');
  });

  it('respects rate limiting when implemented', async () => {
    // Mock rate limiter rejection
    vi.spyOn(require('@/lib/rate-limit'), 'smsRateLimiter').mockResolvedValue({
      success: false,
      limit: 50,
      remaining: 0,
      reset: Date.now() + 60000,
    });

    await expect(
      sendBulkSMS({
        recipients: testRecipients,
        message: testMessage,
      })
    ).rejects.toThrow(/rate limit/i);

    // No notifications should be created
    const count = await prisma.notification.count({
      where: { userId: testUserId },
    });

    expect(count).toBe(0);
  });

  it('logs failed SMS attempts', async () => {
    vi.mocked(smsProvider.sendBulkSMS).mockResolvedValue({
      successCount: 0,
      failed: ['+254712345678', '+254723456789'],
    });

    // Spy on logger or audit log function
    const logSpy = vi.spyOn(require('@/lib/logger'), 'error');

    await sendBulkSMS({
      recipients: testRecipients,
      message: testMessage,
    });

    expect(logSpy).toHaveBeenCalledWith(
      expect.stringContaining('SMS delivery failed'),
      expect.objectContaining({
        failedRecipients: ['+254712345678', '+254723456789'],
      })
    );
  });
});