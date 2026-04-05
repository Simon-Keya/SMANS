// tests/integration/api/attendance.api.test.ts
import { POST } from '@/app/api/attendance/route';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { NextRequest } from 'next/server'; // ← Important: Use NextRequest

jest.mock('next-auth');

describe('Attendance API Integration', () => {
  beforeEach(async () => {
    await prisma.attendance.deleteMany({});
  });

  it('should mark attendance for multiple students', async () => {
    const mockSession = { user: { id: 'teacher-1', role: 'TEACHER' } };
    (getServerSession as jest.Mock).mockResolvedValue(mockSession);

    const attendanceData = {
      date: new Date().toISOString(),
      records: [
        { studentId: 's1', classId: 'cls-101', present: true },
        { studentId: 's2', classId: 'cls-101', present: false },
        { studentId: 's3', classId: 'cls-101', present: true },
      ],
    };

    // Use NextRequest instead of Request
    const request = new NextRequest('http://localhost/api/attendance', {
      method: 'POST',
      body: JSON.stringify(attendanceData),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await POST(request);
    const result = await response.json();

    expect(response.status).toBe(201);
    expect(result.success).toBe(true);
    expect(result.count).toBeGreaterThan(0);
  });

  it('should return 403 for non-teacher/admin users', async () => {
    const mockSession = { user: { id: 'student-1', role: 'STUDENT' } };
    (getServerSession as jest.Mock).mockResolvedValue(mockSession);

    const request = new NextRequest('http://localhost/api/attendance', {
      method: 'POST',
      body: JSON.stringify({ 
        date: new Date().toISOString(), 
        records: [] 
      }),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await POST(request);

    expect(response.status).toBe(403);
  });
});