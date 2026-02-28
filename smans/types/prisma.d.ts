// types/prisma.d.ts

declare global {
  namespace Prisma {
    // Add custom client extensions here if you use them
    interface PrismaClientOptions {
      // log?: Array<LogLevel | LogDefinition>;
    }
  }
}

// Make sure file is treated as module
export type { };
