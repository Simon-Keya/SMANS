// types/index.ts
// Central barrel file — re-export all types for easy importing

// Core domain types
export * from './audit';
export * from './class';
export * from './exam';
export * from './fee';
export * from './grade';
export * from './notification';
export * from './parent';
export * from './role';
export * from './student';
export * from './subject';
export * from './teacher';
export * from './user';

// Feature-specific types
export * from './api';
export * from './assignment';
export * from './attendance';
export * from './common';

// NextAuth & Prisma type augmentations (important!)
export type * from './next-auth';
export type * from './prisma';

// Re-export Role for convenience (most commonly used)
export type { Role } from './role';
