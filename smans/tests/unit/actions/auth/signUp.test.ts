// tests/unit/actions/auth/signUp.test.ts
import { signUp } from '@/app/actions/auth/signUp';
import { prisma } from '@/lib/prisma';
import { hash } from 'bcryptjs';

jest.mock('@/lib/prisma');
jest.mock('bcryptjs');

describe('signUp Action', () => {
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
      ...newUserData,
      password: 'hashedpassword',
    };

    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null); // email not taken
    (hash as jest.Mock).mockResolvedValue('hashedpassword');
    (prisma.user.create as jest.Mock).mockResolvedValue(mockCreatedUser);

    const result = await signUp(newUserData);

    expect(result.success).toBe(true);
    expect(result.user?.email).toBe(newUserData.email);
    expect(prisma.user.create).toHaveBeenCalled();
  });

  it('should throw error if email already exists', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: 'existing' });

    await expect(
      signUp({
        name: 'Duplicate',
        email: 'existing@school.com',
        password: 'pass',
        role: 'STUDENT',
      })
    ).rejects.toThrow('User with this email already exists');
  });
});