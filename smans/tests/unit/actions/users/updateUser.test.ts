// tests/unit/actions/users/updateUser.test.ts
import { updateUser } from '@/app/actions/users/updateUser';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';

jest.mock('@/lib/prisma');
jest.mock('next-auth');

describe('updateUser Action', () => {
  const mockAdminSession = { user: { id: 'admin-1', role: 'ADMIN' as const } };
  const mockUserSession = { user: { id: 'user-123', role: 'TEACHER' as const } };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should allow ADMIN to update any user', async () => {
    (getServerSession as jest.Mock).mockResolvedValue(mockAdminSession);
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: 'target-1' });
    (prisma.user.update as jest.Mock).mockResolvedValue({ id: 'target-1', name: 'Updated Name' });

    const result = await updateUser('target-1', { name: 'Updated Name' });

    expect(result.success).toBe(true);
    expect(prisma.user.update).toHaveBeenCalled();
  });

  it('should allow user to update their own name', async () => {
    (getServerSession as jest.Mock).mockResolvedValue(mockUserSession);
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: 'user-123' });
    (prisma.user.update as jest.Mock).mockResolvedValue({ id: 'user-123', name: 'New Name' });

    const result = await updateUser('user-123', { name: 'New Name' });

    expect(result.success).toBe(true);
  });

  it('should prevent non-admin from changing role', async () => {
    (getServerSession as jest.Mock).mockResolvedValue(mockUserSession);

    await expect(
      updateUser('user-123', { role: 'ADMIN' })
    ).rejects.toThrow('Only admins can change roles');
  });

  it('should throw error if user does not exist', async () => {
    (getServerSession as jest.Mock).mockResolvedValue(mockAdminSession);
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

    await expect(
      updateUser('nonexistent', { name: 'Test' })
    ).rejects.toThrow('User not found');
  });
});