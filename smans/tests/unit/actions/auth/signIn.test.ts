// tests/unit/actions/auth/signIn.test.ts
import { signIn } from '@/app/actions/auth/signIn';
import { prisma } from '@/lib/prisma';
import { compare } from 'bcryptjs';

jest.mock('@/lib/prisma');
jest.mock('bcryptjs');

describe('signIn Action', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should successfully sign in with correct credentials', async () => {
    const mockUser = {
      id: 'user-123',
      email: 'test@school.com',
      password: 'hashedpassword',
      name: 'Test User',
      role: 'TEACHER' as const,
    };

    (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
    (compare as jest.Mock).mockResolvedValue(true);

    const result = await signIn({
      email: 'test@school.com',
      password: 'password123',
    });

    expect(result.success).toBe(true);
    expect(result.user).toEqual({
      id: mockUser.id,
      name: mockUser.name,
      email: mockUser.email,
      role: mockUser.role,
    });
  });

  it('should throw error for invalid credentials', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

    await expect(
      signIn({
        email: 'wrong@email.com',
        password: 'wrongpass',
      })
    ).rejects.toThrow('Invalid email or password');
  });

  it('should throw error when password does not match', async () => {
    const mockUser = { id: '1', email: 'test@school.com', password: 'hashed' };

    (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
    (compare as jest.Mock).mockResolvedValue(false);

    await expect(
      signIn({ email: 'test@school.com', password: 'wrong' })
    ).rejects.toThrow('Invalid email or password');
  });
});