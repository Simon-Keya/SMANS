import nodemailer from "nodemailer";

/**
 * Generates the password reset email content
 */
export function getPasswordResetEmail(
  name: string,
  resetUrl: string,
  expiryMinutes = 60
) {
  return {
    subject: "SMANS Password Reset Request",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #3b82f6; text-align: center;">Password Reset Request</h1>
        
        <p style="font-size: 16px; line-height: 1.6;">
          Hello ${name},
        </p>
        
        <p style="font-size: 16px; line-height: 1.6;">
          We received a request to reset your SMANS account password.
        </p>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}"
             style="display: inline-block; background: #3b82f6; color: white; padding: 14px 32px; 
                    text-decoration: none; border-radius: 8px; font-size: 18px; font-weight: bold;">
            Reset Password
          </a>
        </div>

        <p style="font-size: 14px; color: #555;">
          This link will expire in ${expiryMinutes} minutes.
          If you did not request this reset, please ignore this email.
        </p>

        <p style="font-size: 14px; color: #777; text-align: center; margin-top: 40px;">
          Best regards,<br/>
          <strong>SMANS Security Team</strong>
        </p>
      </div>
    `,
    text: `
Hello ${name},

We received a request to reset your SMANS account password.

Reset here: ${resetUrl}

This link expires in ${expiryMinutes} minutes.

If you did not request this, ignore this email.

SMANS Security Team
    `.trim(),
  };
}

/**
 * Sends the password reset email
 */
export async function sendPasswordResetEmail(
  to: string,
  name: string,
  resetUrl: string
) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const email = getPasswordResetEmail(name, resetUrl);

  await transporter.sendMail({
    from: `"SMANS Security" <${process.env.SMTP_FROM}>`,
    to,
    subject: email.subject,
    html: email.html,
    text: email.text,
  });
}