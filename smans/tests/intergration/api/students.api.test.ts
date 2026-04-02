// tests/integration/api/students.api.test.ts
import { GET, POST } from '@/app/api/students/route'; // Adjust path if your route is different
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';

jest.mock('next-auth');

describe('Students API Integration', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    // Clean students table before each test
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

    const request = new Request('http://localhost:3000/api/students', {
      method: 'POST',
      body: JSON.stringify(studentData),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await POST(request);
    const result = await response.json();

    expect(response.status).toBe(201);
    expect(result.success).toBe(true);
    expect(result.student.name).toBe('Jane Mwangi');
    expect(result.student.admissionNumber).toBe('ADM2026001');
  });

  it('should return list of students via GET', async () => {
    // Seed some test data
    await prisma.student.createMany({
      data: [
        { name: 'Alice', admissionNumber: 'A001', classId: 'cls-001' },
        { name: 'Bob', admissionNumber: 'A002', classId: 'cls-001' },
      ],
    });

    const request = new Request('http://localhost:3000/api/students');
    const response = await GET(request);
    const result = await response.json();

    expect(response.status).toBe(200);
    expect(result.students.length).toBeGreaterThanOrEqual(2);
  });
});