// tests/unit/lib/permissions.test.ts
import { hasPermission, Permission, Role } from '@/lib/permissions';

describe('Permissions System', () => {
  describe('ADMIN role', () => {
    it('should have full access to everything', () => {
      expect(hasPermission('ADMIN', '*')).toBe(true);
      expect(hasPermission('ADMIN', 'students:write')).toBe(true);
      expect(hasPermission('ADMIN', 'fees:pay')).toBe(true);
      expect(hasPermission('ADMIN', 'attendance:mark')).toBe(true);
      expect(hasPermission('ADMIN', 'notifications:send')).toBe(true);
    });
  });

  describe('TEACHER role', () => {
    it('should be able to manage attendance, grades and exams', () => {
      expect(hasPermission('TEACHER', 'attendance:mark')).toBe(true);
      expect(hasPermission('TEACHER', 'attendance:read')).toBe(true);
      expect(hasPermission('TEACHER', 'grades:enter')).toBe(true);
      expect(hasPermission('TEACHER', 'grades:read')).toBe(true);
      expect(hasPermission('TEACHER', 'exams:create')).toBe(true);
      expect(hasPermission('TEACHER', 'reports:generate')).toBe(true);

      // Should not have fees access
      expect(hasPermission('TEACHER', 'fees:pay')).toBe(false);
    });
  });

  describe('STUDENT role', () => {
    it('should have limited self-access only', () => {
      expect(hasPermission('STUDENT', 'grades:read')).toBe(true);
      expect(hasPermission('STUDENT', 'attendance:read')).toBe(true);
      expect(hasPermission('STUDENT', 'profile:read')).toBe(true);

      expect(hasPermission('STUDENT', 'grades:enter')).toBe(false);
      expect(hasPermission('STUDENT', 'attendance:mark')).toBe(false);
    });
  });

  describe('PARENT role', () => {
    it('should have access to their children’s information', () => {
      expect(hasPermission('PARENT', 'students:read')).toBe(true);
      expect(hasPermission('PARENT', 'grades:read')).toBe(true);
      expect(hasPermission('PARENT', 'fees:read')).toBe(true);

      expect(hasPermission('PARENT', 'grades:enter')).toBe(false);
    });
  });

  describe('Edge cases', () => {
    it('should return false for unknown roles', () => {
      expect(hasPermission('UNKNOWN' as Role, 'students:read' as Permission)).toBe(false);
    });

    it('should support wildcard permissions for ADMIN', () => {
      expect(hasPermission('ADMIN', 'any:random' as Permission)).toBe(true);
    });
  });
});