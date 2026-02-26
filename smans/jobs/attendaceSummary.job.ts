// jobs/attendanceSummary.job.ts
import { logger } from "@/lib/logger";
import { prisma } from "@/lib/prisma";
import { EmailService } from "@/lib/services/email.service";

interface AttendanceSummaryJobData {
  classId: string;
  date: string; // ISO date string
  teacherEmail: string;
  teacherName: string;
}

/**
 * Job: Generate and send daily attendance summary to teacher
 */
export async function attendanceSummaryJob(data: AttendanceSummaryJobData) {
  const { classId, date: dateStr, teacherEmail, teacherName } = data;

  try {
    const targetDate = new Date(dateStr);
    if (isNaN(targetDate.getTime())) {
      throw new Error("Invalid date format");
    }

    // Fetch attendance for the class on that date
    const attendanceRecords = await prisma.attendance.findMany({
      where: {
        classId,
        date: {
          gte: new Date(targetDate.setHours(0, 0, 0, 0)),
          lt: new Date(targetDate.setHours(23, 59, 59, 999)),
        },
      },
      include: {
        student: {
          select: {
            name: true,
            rollNumber: true,
          },
        },
      },
      orderBy: { student: { name: "asc" } },
    });

    if (attendanceRecords.length === 0) {
      logger.info(`No attendance records found for class ${classId} on ${dateStr}`);
      return { success: true, message: "No records to summarize" };
    }

    // Calculate summary
    const total = attendanceRecords.length;
    const present = attendanceRecords.filter(r => r.status === "PRESENT").length;
    const absent = attendanceRecords.filter(r => r.status === "ABSENT").length;
    const late = attendanceRecords.filter(r => r.status === "LATE").length;
    const attendanceRate = total > 0 ? Math.round((present / total) * 100) : 0;

    // Build HTML email content
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px;">
        <h2>Daily Attendance Summary - ${targetDate.toDateString()}</h2>
        <p>Dear ${teacherName},</p>
        <p>Here is the attendance summary for your class:</p>
        
        <table style="width:100%; border-collapse: collapse; margin: 20px 0;">
          <tr style="background:#f3f4f6;">
            <th style="padding:12px; border:1px solid #ddd;">Status</th>
            <th style="padding:12px; border:1px solid #ddd;">Count</th>
            <th style="padding:12px; border:1px solid #ddd;">Percentage</th>
          </tr>
          <tr>
            <td style="padding:12px; border:1px solid #ddd;">Present</td>
            <td style="padding:12px; border:1px solid #ddd;">${present}</td>
            <td style="padding:12px; border:1px solid #ddd;">${attendanceRate}%</td>
          </tr>
          <tr>
            <td style="padding:12px; border:1px solid #ddd;">Absent</td>
            <td style="padding:12px; border:1px solid #ddd;">${absent}</td>
            <td style="padding:12px; border:1px solid #ddd;">${Math.round((absent/total)*100)}%</td>
          </tr>
          <tr>
            <td style="padding:12px; border:1px solid #ddd;">Late</td>
            <td style="padding:12px; border:1px solid #ddd;">${late}</td>
            <td style="padding:12px; border:1px solid #ddd;">${Math.round((late/total)*100)}%</td>
          </tr>
          <tr style="background:#f3f4f6; font-weight:bold;">
            <td style="padding:12px; border:1px solid #ddd;">Total</td>
            <td style="padding:12px; border:1px solid #ddd;">${total}</td>
            <td style="padding:12px; border:1px solid #ddd;">100%</td>
          </tr>
        </table>

        <p>Full details are available in your dashboard.</p>
        <p>Best regards,<br/>SMANS System</p>
      </div>
    `;

    // Send email to teacher
    await EmailService.send(
      teacherEmail,
      `Attendance Summary - ${targetDate.toDateString()}`,
      html
    );

    logger.info(`Attendance summary sent for class ${classId} on ${dateStr}`, {
      total, present, absent, late,
    });

    return { success: true };
  } catch (error) {
    logger.error("Attendance summary job failed", { error, classId, date: dateStr });
    throw error;
  }
}