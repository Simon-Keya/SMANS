// tests/unit/lib/password.test.ts
import { resetPasswordAction } from '@/app/actions/auth/resetPassword';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

jest.mock('@/lib/prisma');
jest.mock('bcryptjs');

describe('resetPasswordAction', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should successfully reset password with valid token', async () => {
    const mockToken = 'valid-reset-token';
    const mockHashedToken = 'hashed-reset-token';
    const mockNewPassword = 'newSecurePass123';
    const mockHashedPassword = 'hashedNewPassword';

    const mockResetTokenRecord = {
      id: 'token-001',
      token: mockHashedToken,
      userId: 'user-123',
      expiresAt: new Date(Date.now() + 1000 * 60 * 60), // 1 hour from now
      user: { id: 'user-123' },
    };

    (bcrypt.hash as jest.Mock)
      .mockResolvedValueOnce(mockHashedToken)      // for token lookup
      .mockResolvedValueOnce(mockHashedPassword);  // for new password

    (prisma.passwordResetToken.findFirst as jest.Mock).mockResolvedValue(mockResetTokenRecord);
    (prisma.user.update as jest.Mock).mockResolvedValue({});
    (prisma.passwordResetToken.delete as jest.Mock).mockResolvedValue({});
    (prisma.passwordResetToken.deleteMany as jest.Mock).mockResolvedValue({});

    const result = await resetPasswordAction(mockToken, mockNewPassword);

    expect(result.success).toBe(true);
    expect(result.message).toBe("Password reset successful.");

    expect(prisma.passwordResetToken.findFirst).toHaveBeenCalled();
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: 'user-123' },
      data: { password: mockHashedPassword },
    });
    expect(prisma.passwordResetToken.delete).toHaveBeenCalled();
  });

  it('should throw error if token or password is missing', async () => {
    await expect(resetPasswordAction('', 'newpass123')).rejects.toThrow(
      "Token and new password are required."
    );

    await expect(resetPasswordAction('validtoken', '')).rejects.toThrow(
      "Token and new password are required."
    );
  });

  it('should throw error if password is too short', async () => {
    await expect(resetPasswordAction('validtoken', 'short')).rejects.toThrow(
      "Password must be at least 8 characters long."
    );
  });

  it('should throw error for invalid or expired token', async () => {
    (prisma.passwordResetToken.findFirst as jest.Mock).mockResolvedValue(null);

    await expect(
      resetPasswordAction('invalid-token', 'newSecurePass123')
    ).rejects.toThrow("Invalid or expired reset token. Please request a new one.");
  });
});