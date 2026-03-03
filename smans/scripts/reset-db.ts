
// Run with: npx ts-node scripts/reset-db.ts

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function resetDatabase() {
  console.log('⚠️  Resetting database... This will delete ALL data!')

  const confirm = process.argv.includes('--force') ||
    (await new Promise(resolve => {
      process.stdout.write('Type "yes" to continue: ')
      process.stdin.once('data', d => resolve(d.toString().trim() === 'yes'))
    })) as boolean

  if (!confirm) {
    console.log('Reset cancelled.')
    process.exit(0)
  }

  console.log('Dropping all tables...')

  await prisma.$transaction([
    prisma.attendance.deleteMany(),
    prisma.grade.deleteMany(),
    prisma.exam.deleteMany(),
    prisma.invoice.deleteMany(),
    prisma.payment.deleteMany(),
    prisma.feeItem.deleteMany(),
    prisma.student.deleteMany(),
    prisma.parent.deleteMany(),
    prisma.class.deleteMany(),
    prisma.user.deleteMany(),
    // Add all other models here
  ])

  console.log('Database reset complete.')
  console.log('Next steps:')
  console.log('  npx prisma migrate dev --name init')
  console.log('  npx ts-node scripts/seed.ts')
}

resetDatabase()
  .catch(e => {
    console.error('Reset failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })