// tests/unit/lib/permissions.test.ts
import { hasPermission } from '@/lib/permissions';

describe('Permissions System', () => {
  it('ADMIN should have full access', () => {
    expect(hasPermission('ADMIN', 'any:permission')).toBe(true);
    expect(hasPermission('ADMIN', 'fees:manage')).toBe(true);
  });

  it('ACCOUNTANT should only manage fees', () => {
    expect(hasPermission('ACCOUNTANT', 'fees:record')).toBe(true);
    expect(hasPermission('ACCOUNTANT', 'fees:view')).toBe(true);
    expect(hasPermission('ACCOUNTANT', 'students:create')).toBe(false);
    expect(hasPermission('ACCOUNTANT', 'attendance:mark')).toBe(false);
  });

  it('TEACHER should manage attendance and grades', () => {
    expect(hasPermission('TEACHER', 'attendance:mark')).toBe(true);
    expect(hasPermission('TEACHER', 'grades:enter')).toBe(true);
    expect(hasPermission('TEACHER', 'fees:manage')).toBe(false);
  });

  it('STUDENT and PARENT should have limited access', () => {
    expect(hasPermission('STUDENT', 'profile:view')).toBe(true);
    expect(hasPermission('PARENT', 'children:view')).toBe(true);
  });
});