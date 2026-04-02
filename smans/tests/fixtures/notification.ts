// tests/fixtures/notifications.ts
export const testNotifications = {
    meeting: {
      title: 'Parent-Teacher Meeting',
      message: 'Scheduled for Friday 5th April at 2:00 PM in the school hall.',
      userIds: ['parent-001', 'parent-002'],
    },
  
    exam: {
      title: 'Mid-Term Exams Reminder',
      message: 'Mid-term examinations begin next week. Please ensure all students are prepared.',
      userIds: ['student-001', 'student-002'],
    },
  
    fee: {
      title: 'Fee Payment Reminder',
      message: 'Term 2 school fees are due by 15th April 2026.',
      userIds: ['parent-001'],
    },
  } as const;