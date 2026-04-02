// tests/unit/lib/utils.test.ts
import { cn } from '@/lib/utils';

describe('cn utility (className merger)', () => {
  it('should merge Tailwind classes correctly', () => {
    expect(cn('text-red-500', 'bg-blue-500')).toBe('text-red-500 bg-blue-500');
  });

  it('should handle conditional classes', () => {
    expect(cn('base-class', true && 'active', false && 'hidden')).toBe('base-class active');
  });

  it('should override conflicting classes', () => {
    expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500');
  });
});