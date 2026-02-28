// types/index.ts
// Re-export all types cleanly — use 'type' for .d.ts files

export * from './api';
export * from './assignment';
export * from './attendance';
export * from './class';
export * from './common';
export * from './fee';
export * from './grade';
export * from './notification';
export * from './student';
export * from './teacher';
export * from './user';

// For .d.ts files (declaration files), use type re-export
export type * from './next-auth.d.ts';
export type * from './prisma.d.ts';

