// jobs/report.job.ts
import { logger } from "@/lib/logger";
import { EmailService } from "@/lib/services/email.service";
import { ReportService } from "@/lib/services/report.service";

interface ReportJobData {
  type: "student" | "class";
  id: string; // studentId or classId
  recipientEmail: string;
  recipientName: string;
}

export async function generateReport(data: ReportJobData) {
  try {
    let reportData: any;

    if (data.type === "student") {
      reportData = await ReportService.generateStudentReport(data.id);
    } else if (data.type === "class") {
      reportData = await ReportService.generateClassReport(data.id);
    } else {
      throw new Error("Invalid report type");
    }

    // In real app: generate PDF from reportData
    // Here we just send a placeholder email
    await EmailService.sendReportEmail(
      data.recipientEmail,
      data.recipientName,
      data.type,
      reportData
    );

    logger.info(`Report generated and sent: ${data.type} ${data.id}`);
  } catch (error) {
    logger.error("Report job failed", error);
    throw error;
  }
}