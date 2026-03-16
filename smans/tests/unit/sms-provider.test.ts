import { AfricasTalkingProvider } from '@/lib/services/sms/africastalking.provider';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('africastalking');

describe('AfricasTalkingProvider', () => {
  let provider: AfricasTalkingProvider;

  beforeEach(() => {
    provider = new AfricasTalkingProvider();
    vi.clearAllMocks();
  });

  it('sends single SMS successfully', async () => {
    const mockSend = vi.fn().mockResolvedValue({
      SMSMessageData: { MessageParts: [{ MessageId: 'msg-123' }] },
    });

    (require('africastalking') as any).SMS.send = mockSend;

    const result = await provider.sendSMS('+254712345678', 'Test message');

    expect(result.success).toBe(true);
    expect(result.messageId).toBe('msg-123');
    expect(mockSend).toHaveBeenCalledWith(expect.objectContaining({
      to: '+254712345678',
      message: 'Test message',
    }));
  });

  it('handles SMS failure', async () => {
    const mockSend = vi.fn().mockRejectedValue(new Error('API error'));

    (require('africastalking') as any).SMS.send = mockSend;

    const result = await provider.sendSMS('+254712345678', 'Test');

    expect(result.success).toBe(false);
  });
});