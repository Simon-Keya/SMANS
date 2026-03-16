// tests/unit/notifications/sendBulkSMS.test.ts
import { NotificationService } from '@/lib/services/notification.service';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock external SMS provider (e.g. Africa's Talking, Twilio, etc.)
vi.mock('@/lib/services/sms-provider', () => ({
  sendSMS: vi.fn().mockResolvedValue({ success: true, messageId: 'sms-123' }),
}));

describe('sendBulkSMS', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('sends SMS to multiple recipients and logs notifications', async () => {
    const recipients = [
      { phone: '+254712345678', name: 'John' },
      { phone: '+254798765432', name: 'Mary' },
    ];

    const message = 'School fees reminder: Balance due by Friday.';

    const result = await NotificationService.sendBulkSMS(recipients, message);

    expect(result.successCount).toBe(2);
    expect(result.failedCount).toBe(0);
    expect(result.messageIds).toHaveLength(2);

    // Verify SMS provider was called twice
    expect(vi.mocked(require('@/lib/services/sms-provider').sendSMS)).toHaveBeenCalledTimes(2);
  });

  it('handles partial failures gracefully', async () => {
    const recipients = [
      { phone: '+254712345678', name: 'John' },
      { phone: '+254999999999', name: 'Invalid' },
    ];

    vi.mocked(require('@/lib/services/sms-provider').sendSMS)
      .mockResolvedValueOnce({ success: true })
      .mockRejectedValueOnce(new Error('Invalid number'));

    const result = await NotificationService.sendBulkSMS(recipients, 'Test');

    expect(result.successCount).toBe(1);
    expect(result.failedCount).toBe(1);
    expect(result.errors).toHaveLength(1);
  });
});