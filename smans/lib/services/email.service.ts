// lib/services/email.service.ts
import { logger } from "@/lib/logger";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: process.env.NODE_ENV === "production",
  },
});

// Verify transporter on startup (optional but useful)
transporter.verify((error) => {
  if (error) {
    logger.error("Email transporter verification failed", error);
  } else {
    logger.info("Email transporter ready");
  }
});

export class EmailService {
  /**
   * General send method - reusable for all emails
   */
  static async send(
    to: string,
    subject: string,
    html: string,
    text?: string,
    cc?: string | string[]
  ) {
    try {
      const info = await transporter.sendMail({
        from: `"SMANS" <${process.env.SMTP_FROM || "no-reply@smans.co.ke"}>`,
        to,
        subject,
        text: text || html.replace(/<[^>]+>/g, ""), // fallback plain text
        html,
        cc,
      });

      logger.info(`Email sent to ${to}`, { messageId: info.messageId });
      return info;
    } catch (error) {
      logger.error("Failed to send email", { to, subject, error });
      throw error;
    }
  }

  /**
   * Send welcome email
   */
  static async sendWelcome(email: string, name: string) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px;">
        <h1 style="color: #10b981;">Welcome to SMANS, ${name}!</h1>
        <p>Your account has been successfully created.</p>
        <p>Login here: <a href="${process.env.NEXTAUTH_URL}/auth/login">${process.env.NEXTAUTH_URL}/auth/login</a></p>
        <p>If you didn't create this account, please contact the school admin immediately.</p>
        <p>Best regards,<br/>SMANS Team</p>
      </div>
    `;

    return this.send(email, "Welcome to SMANS School Management System", html);
  }

  /**
   * Send invoice notification
   */
  static async sendInvoice(email: string, invoiceId: string, amount: number, dueDate: string) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px;">
        <h1 style="color: #ef4444;">Invoice #${invoiceId} Generated</h1>
        <p>Dear Parent/Guardian,</p>
        <p>A new invoice has been generated:</p>
        <ul>
          <li><strong>Invoice ID:</strong> ${invoiceId}</li>
          <li><strong>Amount:</strong> KES ${amount.toLocaleString()}</li>
          <li><strong>Due Date:</strong> ${dueDate}</li>
        </ul>
        <p>Please log in to your dashboard to view and make payment.</p>
        <a href="${process.env.NEXTAUTH_URL}/dashboard/parent/invoices" style="display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
          View Invoice
        </a>
        <p>Thank you for your prompt payment.</p>
        <p>SMANS Finance Team</p>
      </div>
    `;

    return this.send(email, `New Invoice #${invoiceId} - SMANS`, html);
  }

  /**
   * Send general notification email (used by jobs)
   */
  static async sendNotification(to: string, title: string, message: string) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px;">
        <h2>${title}</h2>
        <p>${message.replace(/\n/g, "<br/>")}</p>
        <p>Log in to your dashboard for more details.</p>
        <a href="${process.env.NEXTAUTH_URL}/dashboard" style="display: inline-block; background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
          Go to Dashboard
        </a>
        <p>SMANS Team</p>
      </div>
    `;

    return this.send(to, title, html);
  }

  /**
   * Send report email (used by report.job.ts)
   */
  static async sendReportEmail(to: string, name: string, type: string, reportData: any) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px;">
        <h2>${type} Report Ready</h2>
        <p>Dear ${name},</p>
        <p>Your ${type.toLowerCase()} report has been generated.</p>
        <p><strong>Summary:</strong></p>
        <pre style="background: #f3f4f6; padding: 16px; border-radius: 8px;">${JSON.stringify(reportData, null, 2)}</pre>
        <p>Log in to view full details.</p>
        <a href="${process.env.NEXTAUTH_URL}/dashboard/reports" style="display: inline-block; background: #8b5cf6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
          View Reports
        </a>
        <p>SMANS Team</p>
      </div>
    `;

    return this.send(to, `${type} Report Ready - SMANS`, html);
  }
}