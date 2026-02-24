// emails/assignmentNotification.ts
export function getAssignmentEmail(studentName: string, assignmentTitle: string, dueDate: string) {
    return {
      subject: `New Assignment: ${assignmentTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif;">
          <h1>New Assignment Posted</h1>
          <p>Dear ${studentName},</p>
          <p>A new assignment has been posted:</p>
          <p><strong>${assignmentTitle}</strong></p>
          <p><strong>Due Date:</strong> ${dueDate}</p>
          <p>Please log in to view details and submit your work.</p>
          <a href="${process.env.NEXTAUTH_URL}/dashboard/student/assignments" style="background: #8b5cf6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
            View Assignment
          </a>
          <p>Best of luck!</p>
          <p>SMANS Academic Team</p>
        </div>
      `,
    };
  }