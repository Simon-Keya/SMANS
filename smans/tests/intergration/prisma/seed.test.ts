// tests/integration/prisma/seed.test.ts
import { prisma } from '@/lib/prisma';
import { main } from '@/prisma/seed';

describe('Database Seeding', () => {
  it('should run seed script successfully', async () => {
    await expect(main()).resolves.not.toThrow();

    // Optional: Verify data was actually created
    const admin = await prisma.user.findUnique({
      where: { email: 'admin@smans.school' },
    });

    expect(admin).toBeTruthy();
    expect(admin?.role).toBe('ADMIN');
  });
});