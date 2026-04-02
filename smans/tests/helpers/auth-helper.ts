// tests/helpers/auth-helper.ts
import { testUsers } from '../fixtures/users';

type Role = 'ADMIN' | 'TEACHER' | 'STUDENT' | 'PARENT' | 'ACCOUNTANT';

export function mockSession(role: Role = 'ADMIN', userId?: string) {
  const user = Object.values(testUsers).find(u => u.role === role) || testUsers.admin;

  return {
    user: {
      id: userId || user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      image: null,
    },
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  };
}

// For use in Jest mocks
export const mockGetServerSession = (role: Role = 'ADMIN') => {
  return jest.fn().mockResolvedValue(mockSession(role));
};