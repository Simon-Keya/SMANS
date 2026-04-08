// prisma/seed.ts
import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma';

export async function main() {
  console.log('🌱 Starting database seeding...');

  try {
    // Clear existing data (safe for testing)
    await prisma.$transaction([
      prisma.payment.deleteMany(),
      prisma.invoice.deleteMany(),
      prisma.attendance.deleteMany(),
      prisma.grade.deleteMany(),
      prisma.passwordResetToken.deleteMany(),
      prisma.emailVerificationToken.deleteMany(),
      prisma.notification.deleteMany(),
      prisma.student.deleteMany(),
      prisma.parent.deleteMany(),
      prisma.user.deleteMany(),
    ]);

    console.log('🧹 Cleared existing data');

    // Create First Admin
    const adminPassword = await bcrypt.hash('admin123', 12);

    const admin = await prisma.user.create({
      data: {
        name: 'System Administrator',
        email: 'admin@smans.school',
        password: adminPassword,
        role: 'ADMIN',
        isActive: true,
      },
    });

    console.log('✅ Admin created:', admin.email);

    // Create Sample Teacher
    const teacherPassword = await bcrypt.hash('teacher123', 12);
    await prisma.user.create({
      data: {
        name: 'Mr. John Kamau',
        email: 'teacher@smans.school',
        password: teacherPassword,
        role: 'TEACHER',
        isActive: true,
      },
    });

    // Create Sample Parent
    const parentPassword = await bcrypt.hash('parent123', 12);
    await prisma.user.create({
      data: {
        name: 'Mrs. Mary Wanjiku',
        email: 'parent@smans.school',
        password: parentPassword,
        role: 'PARENT',
        isActive: true,
      },
    });

    console.log('✅ Sample users created');
    console.log('🎉 Seeding completed successfully!');

  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  }
}

// Run the seed if this file is executed directly
if (require.main === module) {
  main()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}