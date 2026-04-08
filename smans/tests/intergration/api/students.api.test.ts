// tests/integration/api/students.api.test.ts
import { GET, POST } from '@/app/api/students/route';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { NextRequest } from 'next/server';

jest.mock('next-auth');

describe('Students API Integration', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    await prisma.student.deleteMany({});
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('should create a new student via POST', async () => {
    const mockSession = { user: { id: 'admin-1', role: 'ADMIN' } };
    (getServerSession as jest.Mock).mockResolvedValue(mockSession);

    const studentData = {
      name: 'Jane Mwangi',
      admissionNumber: 'ADM2026001',
      dateOfBirth: '2012-03-15',
      gender: 'FEMALE',
      classId: 'cls-001',
    };

    // Use NextRequest instead of Request
    const request = new NextRequest('http://localhost:3000/api/students', {
      method: 'POST',
      body: JSON.stringify(studentData),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await POST(request);
    const result = await response.json();

    expect(response.status).toBe(201);
    expect(result.success).toBe(true);
    expect(result.student?.name).toBe('Jane Mwangi');
    expect(result.student?.admissionNumber).toBe('ADM2026001');
  });

  it('should return list of students via GET', async () => {
    // Seed test data
    await prisma.student.createMany({
      data: [
        { 
          name: 'Alice', 
          admissionNumber: 'A001', 
          classId: 'cls-001' 
        },
        { 
          name: 'Bob', 
          admissionNumber: 'A002', 
          classId: 'cls-001' 
        },
      ],
    });

    // GET does NOT take any argument in your current route
    const response = await GET();
    const result = await response.json();

    expect(response.status).toBe(200);
    expect(result.success).toBe(true);
    expect(Array.isArray(result.data || result.students)).toBe(true);
  });
});