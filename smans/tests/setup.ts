// tests/setup.ts
import '@testing-library/jest-dom';
import { prisma } from './helpers/test-prisma';

// Global test setup
beforeAll(async () => {
  console.log('🧪 Starting SMANS test suite...');
});

// Clean up after each test
afterEach(async () => {
  // Optional: You can choose to clean specific tables instead of full cleanup
  // await prisma.notification.deleteMany({});
});

// Final cleanup
afterAll(async () => {
  await prisma.$disconnect();
  console.log('✅ All tests completed. Database disconnected.');
});

// Mock Next.js server-only features if needed
jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
  revalidateTag: jest.fn(),
}));

// Mock server actions environment
process.env.NODE_ENV = 'test';