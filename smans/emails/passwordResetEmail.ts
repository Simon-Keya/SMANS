// lib/email.ts
import nodemailer from "nodemailer";

// ───────────────────────────────────────────────
// Types
// ───────────────────────────────────────────────
interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
  from: string;
}

// ───────────────────────────────────────────────
// Validate required env vars at startup (crash early if missing)
// ───────────────────────────────────────────────
function getEmailConfig(): EmailConfig {
  // Allow email to be disabled in development
  if (process.env.NODE_ENV === "development" && !process.env.SMTP_HOST) {
    console.warn("⚠️ SMTP not configured - email sending will be simulated");
    return {
      host: "smtp.example.com",
      port: 587,
      secure: false,
      auth: { user: "test", pass: "test" },
      from: "noreply@smans.local",
    };
  }

  const required = ["SMTP_HOST", "SMTP_PORT", "SMTP_USER", "SMTP_PASS", "SMTP_FROM"];
  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables for email: ${missing.join(", ")}`
    );
  }

  const port = Number(process.env.SMTP_PORT);
  if (isNaN(port)) {
    throw new Error("SMTP_PORT must be a number");
  }

  return {
    host: process.env.SMTP_HOST!,
    port,
    secure: port === 465,
    auth: {
      user: process.env.SMTP_USER!,
      pass: process.env.SMTP_PASS!,
    },
    from: process.env.SMTP_FROM!,
  };
}

// ───────────────────────────────────────────────
// Email content generator
// ───────────────────────────────────────────────
export function getPasswordResetEmail(
  name: string,
  resetUrl: string,
  expiryMinutes = 60
) {
  const appName = "SMANS";
  const supportEmail = process.env.SUPPORT_EMAIL || "support@smans.app";

  return {
    subject: `${appName} Password Reset Request`,

    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <title>Reset Your ${appName} Password</title>
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
                        Reset Your Password
                      </h1>
                    </td>
                  </tr>

                  <!-- Content -->
                  <tr>
                    <td style="padding: 40px 30px;">
                      <p style="font-size: 16px; line-height: 1.6; margin: 0 0 24px;">
                        Hello <strong>${name || "User"}</strong>,
                      </p>

                      <p style="font-size: 16px; line-height: 1.6; margin: 0 0 24px;">
                        We received a request to reset your ${appName} password.
                        Click the button below to set a new password:
                      </p>

                      <div style="text-align: center; margin: 32px 0;">
                        <a href="${resetUrl}"
                           style="display: inline-block; background: #3b82f6; color: white; padding: 16px 40px; 
                                  text-decoration: none; border-radius: 8px; font-size: 18px; font-weight: bold; 
                                  box-shadow: 0 4px 12px rgba(59,130,246,0.3);">
                          Reset Password
                        </a>
                      </div>

                      <p style="font-size: 15px; line-height: 1.5; margin: 0 0 24px; color: #555;">
                        This link will expire in <strong>${expiryMinutes} minutes</strong>.
                        If you did not request this reset, please ignore this email — your account remains secure.
                      </p>

                      <p style="font-size: 14px; color: #777; margin-top: 40px; text-align: center;">
                        Need help? Contact us at 
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
    `,

    text: `
Hello ${name || "User"},

We received a request to reset your ${appName} password.

Reset your password here: ${resetUrl}

This link will expire in ${expiryMinutes} minutes.

If you did not request this reset, please ignore this email — your account is safe.

For help, contact ${supportEmail}

Best regards,
${appName} Security Team
    `.trim(),
  };
}

// ───────────────────────────────────────────────
// Send email function
// ───────────────────────────────────────────────
export async function sendPasswordResetEmail({
  to,
  name,
  resetUrl,
}: {
  to: string;
  name?: string;
  resetUrl: string;
}) {
  const config = getEmailConfig();

  // Skip actual email sending in development if SMTP not configured
  if (process.env.NODE_ENV === "development" && !process.env.SMTP_HOST) {
    console.log(`📧 [DEV] Password reset email would be sent to ${to}`);
    console.log(`🔗 [DEV] Reset URL: ${resetUrl}`);
    return { success: true, devMode: true };
  }

  const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: config.auth,
    tls: config.secure ? undefined : { rejectUnauthorized: false },
  });

  if (process.env.NODE_ENV !== "production") {
    try {
      await transporter.verify();
      console.log("SMTP connection verified successfully");
    } catch (err) {
      console.error("SMTP connection error:", err);
    }
  }

  const email = getPasswordResetEmail(name || "User", resetUrl);

  try {
    await transporter.sendMail({
      from: config.from,
      to,
      subject: email.subject,
      html: email.html,
      text: email.text,
    });

    console.log(`Password reset email sent to ${to}`);
    return { success: true };
  } catch (err) {
    console.error("Failed to send password reset email:", err);
    throw new Error("Failed to send reset email. Please try again later.");
  }
}