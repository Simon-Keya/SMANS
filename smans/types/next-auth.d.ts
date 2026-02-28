// types/next-auth.d.ts
import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: 'ADMIN' | 'TEACHER' | 'STUDENT' | 'PARENT';
    } & DefaultSession['user'];
  }

  interface User {
    id: string;
    role: 'ADMIN' | 'TEACHER' | 'STUDENT' | 'PARENT';
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: 'ADMIN' | 'TEACHER' | 'STUDENT' | 'PARENT';
  }
}