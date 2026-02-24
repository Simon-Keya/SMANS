 // emails/disciplineAlert.ts
export function getDisciplineAlert(parentName: string, studentName: string, issue: string, date: string) {
    return {
      subject: `Discipline Notice - ${studentName}`,
      html: `
        <div style="font-family: Arial, sans-serif; color: #991b1b;">
          <h1 style="color: #dc2626;">Discipline Alert</h1>
          <p>Dear ${parentName},</p>
          <p>This is to inform you of a disciplinary issue involving your child:</p>
          <p><strong>Student:</strong> ${studentName}</p>
          <p><strong>Issue:</strong> ${issue}</p>
          <p><strong>Date:</strong> ${date}</p>
          <p>Please log in to your parent dashboard for full details and any required action.</p>
          <a href="${process.env.NEXTAUTH_URL}/dashboard/parent/discipline" style="background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
            View Details
          </a>
          <p>We appreciate your cooperation in maintaining school discipline.</p>
          <p>SMANS Administration</p>
        </div>
      `,
    };
  }