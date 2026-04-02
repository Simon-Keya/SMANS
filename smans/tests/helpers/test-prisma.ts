// tests/helpers/test-prisma.ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const testPrisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['query', 'error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = testPrisma;
}

export async function cleanupTestDatabase() {
  await testPrisma.$transaction([
    testPrisma.notification.deleteMany(),
    testPrisma.payment.deleteMany(),
    testPrisma.attendance.deleteMany(),
    testPrisma.student.deleteMany(),
    testPrisma.user.deleteMany(),
  ]);
}

export { testPrisma as prisma };
