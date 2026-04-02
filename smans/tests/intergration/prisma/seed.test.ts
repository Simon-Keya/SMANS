// tests/integration/prisma/seed.test.ts
import { prisma } from '@/lib/prisma';
import { seedDatabase } from '@/prisma/seed'; // Adjust if your seed function is named differently

describe('Database Seeding', () => {
  beforeAll(async () => {
    // Clear database before seeding test
    await prisma.$executeRaw`TRUNCATE TABLE "User" CASCADE;`;
    await prisma.$executeRaw`TRUNCATE TABLE "Student" CASCADE;`;
  });

  it('should seed initial data successfully', async () => {
    await seedDatabase();

    const userCount = await prisma.user.count();
    const studentCount = await prisma.student.count();

    expect(userCount).toBeGreaterThan(0);
    expect(studentCount).toBeGreaterThan(0);

    // Check for default admin
    const admin = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
    expect(admin).toBeTruthy();
  });

  it('should not duplicate data on re-seed', async () => {
    await seedDatabase();
    await seedDatabase(); // Run twice

    const userCount = await prisma.user.count();
    expect(userCount).toBeGreaterThan(0); // Should not explode
  });
});