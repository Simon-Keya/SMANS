// tests/integration/api/attendance.api.test.ts
import { POST } from '@/app/api/attendance/mark/route';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';

jest.mock('next-auth');

describe('Attendance API Integration', () => {
  beforeEach(async () => {
    await prisma.attendance.deleteMany({});
  });

  it('should mark attendance for multiple students', async () => {
    const mockSession = { user: { id: 'teacher-1', role: 'TEACHER' } };
    (getServerSession as jest.Mock).mockResolvedValue(mockSession);

    const attendanceData = {
      classId: 'cls-101',
      date: new Date().toISOString(),
      records: [
        { studentId: 's1', status: 'PRESENT' },
        { studentId: 's2', status: 'ABSENT' },
        { studentId: 's3', status: 'PRESENT' },
      ],
    };

    const request = new Request('http://localhost/api/attendance/mark', {
      method: 'POST',
      body: JSON.stringify(attendanceData),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await POST(request);
    const result = await response.json();

    expect(response.status).toBe(200);
    expect(result.success).toBe(true);
    expect(result.count).toBe(3);
  });
});