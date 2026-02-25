// jobs/report.job.ts
import { logger } from "@/lib/logger";
import { EmailService } from "@/lib/services/email.service";
import { ReportService } from "@/lib/services/report.service";

interface ReportJobData {
  type: "student" | "class"; // only these two are supported right now
  id: string;               // studentId or classId
  recipientEmail: string;
  recipientName: string;
  generatedBy?: string;
}

export async function generateReport(data: ReportJobData) {
  try {
    let reportData: any;

    switch (data.type) {
      case "student":
        reportData = await ReportService.generateStudentReport(data.id);
        break;

      case "class":
        reportData = await ReportService.generateClassReport(data.id);
        break;

      default:
        throw new Error(`Unsupported report type: ${data.type}. Currently only 'student' and 'class' are supported.`);
    }

    // Simple HTML summary for email
    const summary = `
      <div style="font-family: Arial, sans-serif; max-width: 600px;">
        <h2>${data.type.charAt(0).toUpperCase() + data.type.slice(1)} Report</h2>
        <p>Dear ${data.recipientName},</p>
        <p>Your ${data.type} report has been generated successfully.</p>
        <p><strong>Reference ID:</strong> ${data.id}</p>
        <p><strong>Generated at:</strong> ${new Date().toLocaleString()}</p>
        <p>Full report is available in your dashboard.</p>
        <a href="${process.env.NEXTAUTH_URL}/dashboard/reports" style="display: inline-block; background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
          View Dashboard
        </a>
        <p>Best regards,<br/>SMANS Team</p>
      </div>
    `;

    // Send email
    await EmailService.send(
      data.recipientEmail,
      `${data.type.charAt(0).toUpperCase() + data.type.slice(1)} Report Ready`,
      summary
    );

    logger.info(`Report job completed successfully`, {
      type: data.type,
      id: data.id,
      recipient: data.recipientEmail,
    });

    return { success: true, type: data.type, id: data.id };
  } catch (error) {
    logger.error("Report generation job failed", {
      error: error instanceof Error ? error.message : String(error),
      type: data.type,
      id: data.id,
      recipient: data.recipientEmail,
    });

    throw error; // Let BullMQ retry if configured
  }
}