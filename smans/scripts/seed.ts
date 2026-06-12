// scripts/seed.ts
// Run with: npx ts-node scripts/seed.ts
// or add to package.json: "prisma:seed": "ts-node scripts/seed.ts"

import { PrismaClient, Role, InvoiceStatus, PaymentStatus, AttendanceStatus } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding...')

  const hashedAdmin = await bcrypt.hash('admin123', 10)
  const hashedTeacher = await bcrypt.hash('teacher123', 10)
  const hashedParent = await bcrypt.hash('parent123', 10)
  const hashedStudent = await bcrypt.hash('student123', 10)

  // ───────────────────────────────────────────────
  // 1. Create Admin
  // ───────────────────────────────────────────────
  const admin = await prisma.user.upsert({
    where: { email: 'admin@smans.co.ke' },
    update: {},
    create: {
      email: 'admin@smans.co.ke',
      password: hashedAdmin,
      name: 'System Administrator',
      role: Role.ADMIN, // Use enum instead of string
    },
  })
  console.log('Admin created:', admin.email)

  // ───────────────────────────────────────────────
  // 2. Create Teacher + Class
  // ───────────────────────────────────────────────
  const teacher = await prisma.user.upsert({
    where: { email: 'teacher@smans.co.ke' },
    update: {},
    create: {
      email: 'teacher@smans.co.ke',
      password: hashedTeacher,
      name: 'Grace Muthoni',
      role: Role.TEACHER, // Use enum
      staffNo: 'TCH/001/2025',
    },
  })

  const form1 = await prisma.class.upsert({
    where: { name_level: { name: 'Form 1 East', level: 'Form 1' } },
    update: {},
    create: {
      name: 'Form 1 East',
      level: 'Form 1',
      teacherId: teacher.id,
    },
  })
  console.log('Teacher & Class created:', teacher.name, form1.name)

  // ───────────────────────────────────────────────
  // 3. Create Parent + Student
  // ───────────────────────────────────────────────
  // First create the parent user
  const parentUser = await prisma.user.upsert({
    where: { email: 'parent@smans.co.ke' },
    update: {},
    create: {
      email: 'parent@smans.co.ke',
      password: hashedParent,
      name: 'James Kamau',
      role: Role.PARENT, // Use enum
    },
  })

  // Then create the parent record linked to the user
  const parent = await prisma.parent.create({
    data: {
      name: 'James Kamau',
      phone: '0712345678',
      email: 'james.kamau@example.com',
      userId: parentUser.id,
    },
  })

  // Create the student user
  const studentUser = await prisma.user.upsert({
    where: { email: 'student@smans.co.ke' },
    update: {},
    create: {
      email: 'student@smans.co.ke',
      password: hashedStudent,
      name: 'Ethan Kamau',
      role: Role.STUDENT, // Use enum
    },
  })

  // Then create the student record (using admissionNumber, not rollNumber)
  await prisma.student.create({
    data: {
      name: 'Ethan Kamau',
      admissionNumber: 'STU/001/2025', // Changed from rollNumber to admissionNumber
      email: 'ethan@smans.co.ke',
      phone: '0722987654',
      classId: form1.id,
      parentId: parent.id,
      userId: studentUser.id,
    },
  })
  console.log('Parent & Student created')

  // ───────────────────────────────────────────────
  // 4. Create Subjects
  // ───────────────────────────────────────────────
  const subjects = await prisma.subject.createMany({
    data: [
      { name: 'Mathematics', code: 'MATH101' },
      { name: 'English', code: 'ENG101' },
      { name: 'Kiswahili', code: 'KIS101' },
      { name: 'Science', code: 'SCI101' },
      { name: 'Social Studies', code: 'SST101' },
    ],
    skipDuplicates: true,
  })
  console.log('Subjects created')

  // ───────────────────────────────────────────────
  // 5. Create Learning Areas (for CBC)
  // ───────────────────────────────────────────────
  const learningAreas = await prisma.learningArea.createMany({
    data: [
      { name: 'Literacy', code: 'LIT001' },
      { name: 'Numeracy', code: 'NUM001' },
      { name: 'Environmental Activities', code: 'ENV001' },
      { name: 'Psychomotor and Creative Activities', code: 'PCA001' },
      { name: 'Religious Education', code: 'RE001' },
    ],
    skipDuplicates: true,
  })
  console.log('Learning areas created')

  // ───────────────────────────────────────────────
  // 6. Create Fee Items (using correct frequency values)
  // ───────────────────────────────────────────────
  await prisma.feeItem.createMany({
    data: [
      { name: 'Tuition Fee', amount: 28000, frequency: 'TERMLY' }, // Changed to uppercase
      { name: 'Activity Fee', amount: 4500, frequency: 'YEARLY' }, // Changed to uppercase
      { name: 'Exam Fee', amount: 3500, frequency: 'TERMLY' }, // Changed to uppercase
    ],
    skipDuplicates: true,
  })
  console.log('Sample fee items created')

  // ───────────────────────────────────────────────
  // 7. Create Sample Exam
  // ───────────────────────────────────────────────
  const exam = await prisma.exam.create({
    data: {
      name: 'End of Term 1 Examination',
      term: 'TERM_1',
      date: new Date(),
      year: 2025,
      classId: form1.id,
    },
  })
  console.log('Sample exam created')

  // ───────────────────────────────────────────────
  // 8. Create Sample Attendance
  // ───────────────────────────────────────────────
  const student = await prisma.student.findFirst({
    where: { classId: form1.id },
  })

  if (student) {
    await prisma.attendance.create({
      data: {
        date: new Date(),
        status: AttendanceStatus.PRESENT, 
        studentId: student.id,
        classId: form1.id,
      },
    })
    console.log('Sample attendance created')
  }

  // ───────────────────────────────────────────────
  // 9. Create Permissions (if needed)
  // ───────────────────────────────────────────────
  const permissions = await prisma.permission.createMany({
    data: [
      { code: 'users:read', name: 'Read Users', description: 'View user list and details' },
      { code: 'users:write', name: 'Write Users', description: 'Create, update, delete users' },
      { code: 'students:read', name: 'Read Students', description: 'View student list and details' },
      { code: 'students:write', name: 'Write Students', description: 'Create, update, delete students' },
      { code: 'attendance:mark', name: 'Mark Attendance', description: 'Record attendance for students' },
      { code: 'attendance:read', name: 'Read Attendance', description: 'View attendance records' },
      { code: 'grades:enter', name: 'Enter Grades', description: 'Input and edit grades' },
      { code: 'grades:read', name: 'Read Grades', description: 'View grade reports' },
      { code: 'reports:generate', name: 'Generate Reports', description: 'Create system reports' },
    ],
    skipDuplicates: true,
  })
  console.log('Permissions created')

  // ───────────────────────────────────────────────
  // 10. Assign Permissions to Roles
  // ───────────────────────────────────────────────
  // Get permission IDs
  const allPermissions = await prisma.permission.findMany()
  
  // Assign all permissions to ADMIN
  await prisma.rolePermission.createMany({
    data: allPermissions.map(p => ({
      role: Role.ADMIN,
      permissionId: p.id,
    })),
    skipDuplicates: true,
  })
  console.log('Permissions assigned to ADMIN role')

  console.log('🎉 Database seeding completed successfully!')
}

main()
  .catch((e) => {
    console.error('Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })