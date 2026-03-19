// emails/reportCardEmail.ts
import nodemailer from "nodemailer";

interface ReportCardEmailInput {
  to: string;
  studentName: string;
  parentName?: string;
  term: string;
  year: number;
  overallGrade: string;
  gpa?: number;
  reportUrl?: string; // link to PDF or online report card
}

/**
 * Generates the report card email content (HTML + plain text)
 */
export function getReportCardEmail({
  studentName,
  parentName,
  term,
  year,
  overallGrade,
  gpa,
  reportUrl,
}: ReportCardEmailInput) {
  const appName = "SMANS";
  const supportEmail = process.env.SUPPORT_EMAIL || "support@smans.app";

  const subject = `${appName} Report Card - ${term} ${year}`;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>${subject}</title>
      </head>
      <body style="font-family: Arial, Helvetica, sans-serif; margin: 0; padding: 0; background-color: #f4f4f9; color: #333;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f4f4f9; padding: 20px;">
          <tr>
            <td align="center">
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
                <!-- Header -->
                <tr>
                  <td style="background: linear-gradient(to right, #3b82f6, #2563eb); padding: 40px 30px; text-align: center;">
                    <h1 style="margin: 0; color: white; font-size: 28px; font-weight: bold;">
                      ${term} ${year} Report Card
                    </h1>
                  </td>
                </tr>

                <!-- Content -->
                <tr>
                  <td style="padding: 40px 30px;">
                    <p style="font-size: 16px; line-height: 1.6; margin: 0 0 24px;">
                      Dear ${parentName || "Parent/Guardian"},
                    </p>

                    <p style="font-size: 16px; line-height: 1.6; margin: 0 0 24px;">
                      The report card for <strong>${studentName}</strong> for <strong>${term} ${year}</strong> is now available.
                    </p>

                    <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 24px 0;">
                      <p style="font-size: 18px; font-weight: bold; margin: 0 0 12px;">
                        Overall Performance
                      </p>
                      <p style="font-size: 16px; margin: 0;">
                        Grade: <strong>${overallGrade}</strong><br/>
                        ${gpa ? `GPA: <strong>${gpa.toFixed(2)}</strong>` : ""}
                      </p>
                    </div>

                    <div style="text-align: center; margin: 32px 0;">
                      ${reportUrl ? `
                        <a href="${reportUrl}"
                           style="display: inline-block; background: #3b82f6; color: white; padding: 16px 40px; 
                                  text-decoration: none; border-radius: 8px; font-size: 18px; font-weight: bold; 
                                  box-shadow: 0 4px 12px rgba(59,130,246,0.3);">
                          View Full Report Card
                        </a>
                      ` : `
                        <p style="font-size: 16px; color: #555;">
                          The detailed report card has been attached or is available in your parent portal.
                        </p>
                      `}
                    </div>

                    <p style="font-size: 14px; color: #555; line-height: 1.5;">
                      Please review the report and contact the class teacher if you have any questions or concerns.
                    </p>

                    <p style="font-size: 14px; color: #777; margin-top: 40px; text-align: center;">
                      Need assistance? Contact us at 
                      <a href="mailto:${supportEmail}" style="color: #3b82f6;">${supportEmail}</a>
                    </p>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="background: #f8f9fa; padding: 24px; text-align: center; font-size: 13px; color: #666;">
                    © ${new Date().getFullYear()} ${appName}. All rights reserved.<br/>
                    This is an automated email — please do not reply.
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;

  const text = `
Dear ${parentName || "Parent/Guardian"},

The report card for ${studentName} for ${term} ${year} is now available.

Overall Grade: ${overallGrade}
${gpa ? `GPA: ${gpa.toFixed(2)}` : ""}

${reportUrl ? `View full report card: ${reportUrl}` : "Check your parent portal for the detailed report."}

Please review and contact the class teacher if needed.

Support: ${supportEmail}

Best regards,
${appName} Team
  `.trim();

  return { subject, html, text };
}

/**
 * Sends the report card email
 */
export async function sendReportCardEmail(input: ReportCardEmailInput) {
  const config = {
    host: process.env.SMTP_HOST!,
    port: Number(process.env.SMTP_PORT),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER!,
      pass: process.env.SMTP_PASS!,
    },
    from: process.env.SMTP_FROM!,
  };

  if (!config.host || !config.auth.user || !config.auth.pass || !config.from) {
    throw new Error("Missing SMTP configuration in environment variables");
  }

  const transporter = nodemailer.createTransport(config);

  const email = getReportCardEmail(input);

  try {
    await transporter.sendMail({
      from: `"SMANS" <${config.from}>`,
      to: input.to,
      subject: email.subject,
      html: email.html,
      text: email.text,
    });

    console.log(`Report card email sent to ${input.to}`);
    return { success: true };
  } catch (err) {
    console.error("Failed to send report card email:", err);
    throw new Error("Failed to send report card email");
  }
}