// tests/unit/actions/auth/signIn.test.ts
import { signInAction } from '@/app/actions/auth/signIn';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

jest.mock('@/lib/prisma');
jest.mock('bcryptjs');

describe('signInAction', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should successfully authenticate user with correct credentials', async () => {
    const mockUser = {
      id: 'user-123',
      email: 'test@school.com',
      password: 'hashedpassword123',
      name: 'Test User',
      role: 'TEACHER',
    };

    (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);

    const result = await signInAction({
      email: 'test@school.com',
      password: 'password123',
    });

    expect(result.success).toBe(true);
    // Note: Since the real action redirects, we expect success message in test
    expect(result.error).toBeUndefined();
  });

  it('should return error if email or password is missing', async () => {
    const result = await signInAction({
      email: '',
      password: 'password123',
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe('Email and password are required');
  });

  it('should return error when user is not found', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

    const result = await signInAction({
      email: 'nonexistent@school.com',
      password: 'password123',
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe('Invalid email or password');
  });

  it('should return error when password is incorrect', async () => {
    const mockUser = {
      id: 'user-123',
      email: 'test@school.com',
      password: 'hashedpassword123',
      name: 'Test User',
      role: 'TEACHER',
    };

    (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    const result = await signInAction({
      email: 'test@school.com',
      password: 'wrongpassword',
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe('Invalid email or password');
  });

  it('should apply rate limiting', async () => {
    // This test assumes rate limiter returns failure after limit
    // In real tests you might want to mock the Ratelimit class
    const result = await signInAction({
      email: 'test@school.com',
      password: 'password123',
    });

    // The actual behavior depends on your rate limiter implementation
    // This is a placeholder for rate limit failure case
    // You can expand this when you have full rate limit mocking
  });
});