// tests/unit/lib/password.test.ts
import { hashPassword, verifyPassword } from '@/lib/password';

describe('Password Utilities', () => {
  it('should hash password successfully', async () => {
    const hashed = await hashPassword('mysecretpassword');
    expect(hashed).toBeDefined();
    expect(typeof hashed).toBe('string');
    expect(hashed.length).toBeGreaterThan(10);
  });

  it('should verify correct password', async () => {
    const hashed = await hashPassword('test123');
    const isValid = await verifyPassword('test123', hashed);
    expect(isValid).toBe(true);
  });

  it('should reject incorrect password', async () => {
    const hashed = await hashPassword('test123');
    const isValid = await verifyPassword('wrongpass', hashed);
    expect(isValid).toBe(false);
  });
});