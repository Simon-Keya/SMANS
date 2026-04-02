// tests/fixtures/students.ts
export const testStudents = {
    john: {
      id: 'stud-john-001',
      name: 'John Kamau',
      admissionNumber: 'ADM2026002',
      dateOfBirth: new Date('2011-06-12'),
      gender: 'MALE' as const,
      classId: 'cls-101',
      parentId: 'parent-001',
    },
  
    aisha: {
      id: 'stud-aisha-001',
      name: 'Aisha Mohammed',
      admissionNumber: 'ADM2026001',
      dateOfBirth: new Date('2012-03-15'),
      gender: 'FEMALE' as const,
      classId: 'cls-101',
      parentId: 'parent-001',
    },
  
    peter: {
      id: 'stud-peter-001',
      name: 'Peter Ochieng',
      admissionNumber: 'ADM2026003',
      dateOfBirth: new Date('2010-11-20'),
      gender: 'MALE' as const,
      classId: 'cls-102',
      parentId: 'parent-002',
    },
  } as const;