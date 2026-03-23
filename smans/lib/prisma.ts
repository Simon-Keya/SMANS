// lib/prisma.ts  (or prisma.ts — both are fine)

import { PrismaClient } from '@prisma/client';

// Add prisma to the Node.js global type so we can access it in development
// This prevents multiple PrismaClient instances during hot-reloading
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

// Create or reuse PrismaClient instance
const prismaClientSingleton = () => {
  return new PrismaClient({
    // Optional: enable query logging in development
    log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
  });
};

// Type for the prisma global variable
type PrismaSingleton = ReturnType<typeof prismaClientSingleton>;

// Use globalThis to store the singleton in development
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaSingleton | undefined;
};

// Export the singleton instance
const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

// In development, attach to global to prevent multiple instances on hot reload
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export { prisma };

