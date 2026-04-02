// tests/fixtures/users.ts
export const testUsers = {
    admin: {
      id: 'admin-001',
      name: 'Simon Keya',
      email: 'admin@smans.school',
      password: 'password123',
      role: 'ADMIN' as const,
      phone: '+254712345678',
      status: 'ACTIVE',
    },
  
    accountant: {
      id: 'acc-001',
      name: 'Jane Muthoni',
      email: 'accountant@smans.school',
      password: 'password123',
      role: 'ACCOUNTANT' as const,
      phone: '+254723456789',
      status: 'ACTIVE',
    },
  
    teacher: {
      id: 'teacher-001',
      name: 'Mr. David Omondi',
      email: 'teacher@smans.school',
      password: 'password123',
      role: 'TEACHER' as const,
      staffNo: 'TCH-045',
      status: 'ACTIVE',
    },
  
    student: {
      id: 'student-001',
      name: 'Aisha Mohammed',
      email: 'aisha.student@smans.school',
      password: 'password123',
      role: 'STUDENT' as const,
      admissionNumber: 'ADM2026001',
      status: 'ACTIVE',
    },
  
    parent: {
      id: 'parent-001',
      name: 'Mrs. Fatima Ali',
      email: 'parent@smans.school',
      password: 'password123',
      role: 'PARENT' as const,
      status: 'ACTIVE',
    },
  } as const;
  
  export type TestUser = typeof testUsers[keyof typeof testUsers];