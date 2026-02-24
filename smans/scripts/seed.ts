// scripts/seed.ts
// Run with: npx ts-node scripts/seed.ts
// or add to package.json: "prisma:seed": "ts-node scripts/seed.ts"

import { PrismaClient } from '@prisma/client'
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
      role: 'ADMIN',
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
      role: 'TEACHER',
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
  const parent = await prisma.parent.create({
    data: {
      name: 'James Kamau',
      phone: '0712 345 678',
      email: 'james.kamau@example.com',
      user: {
        create: {
          email: 'parent@smans.co.ke',
          password: hashedParent,
          name: 'James Kamau',
          role: 'PARENT',
        },
      },
    },
  })

  await prisma.student.create({
    data: {
      name: 'Ethan Kamau',
      rollNumber: 'STU/001/2025',
      email: 'ethan@smans.co.ke',
      phone: '0722 987 654',
      classId: form1.id,
      parentId: parent.id,
      user: {
        create: {
          email: 'student@smans.co.ke',
          password: hashedStudent,
          name: 'Ethan Kamau',
          role: 'STUDENT',
        },
      },
    },
  })
  console.log('Parent & Student created')

  // ───────────────────────────────────────────────
  // 4. Optional: Create a few more records
  // ───────────────────────────────────────────────
  await prisma.feeItem.createMany({
    data: [
      { name: 'Tuition Fee', amount: 28000, frequency: 'termly' },
      { name: 'Activity Fee', amount: 4500, frequency: 'yearly' },
      { name: 'Exam Fee', amount: 3500, frequency: 'termly' },
    ],
    skipDuplicates: true,
  })

  console.log('Sample fee items created')

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