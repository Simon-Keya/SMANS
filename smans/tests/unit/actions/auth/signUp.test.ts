// tests/unit/actions/auth/signUp.test.ts
import { signUpAction } from '@/app/actions/auth/signUp';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

jest.mock('@/lib/prisma');
jest.mock('bcryptjs');
jest.mock('@/emails/verificationEmail');
jest.mock('@/lib/upstash/redis');

describe('signUpAction', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should successfully create a new user', async () => {
    const newUserData = {
      name: 'New Student',
      email: 'newstudent@school.com',
      password: 'securepass123',
      role: 'STUDENT' as const,
    };

    const mockCreatedUser = {
      id: 'new-user-001',
      name: newUserData.name,
      email: newUserData.email.toLowerCase(),
      role: 'STUDENT',
    };

    // Mock dependencies
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null); // email not taken
    (prisma.user.count as jest.Mock).mockResolvedValue(5); // not first user
    (bcrypt.hash as jest.Mock).mockResolvedValue('hashedpassword123');
    (prisma.user.create as jest.Mock).mockResolvedValue(mockCreatedUser);

    const result = await signUpAction(newUserData);

    expect(result.success).toBe(true);
    expect(result.userId).toBe('new-user-001');
    expect(result.message).toContain('Account created');
    expect(prisma.user.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        name: 'New Student',
        email: 'newstudent@school.com',
        role: 'STUDENT',
      }),
    });
  });

  it('should return error if email already exists', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: 'existing-user' });

    const result = await signUpAction({
      name: 'Duplicate User',
      email: 'existing@school.com',
      password: 'password123',
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe('Email already in use');
    expect(prisma.user.create).not.toHaveBeenCalled();
  });

  it('should enforce minimum password length', async () => {
    const result = await signUpAction({
      name: 'Short Pass',
      email: 'short@school.com',
      password: '123',
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe('Password must be at least 8 characters');
  });

  it('should make the first user an ADMIN', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
    (prisma.user.count as jest.Mock).mockResolvedValue(0); // first user
    (bcrypt.hash as jest.Mock).mockResolvedValue('hashedpassword');
    (prisma.user.create as jest.Mock).mockResolvedValue({
      id: 'admin-001',
      role: 'ADMIN',
    });

    const result = await signUpAction({
      name: 'First Admin',
      email: 'admin@school.com',
      password: 'adminpass123',
    });

    expect(result.success).toBe(true);
    expect(result.message).toContain('First admin account created');
    
    expect(prisma.user.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ role: 'ADMIN' }),
      })
    );
  });
});