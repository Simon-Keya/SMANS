// emails/verificationEmail.ts
import nodemailer from "nodemailer";

interface SendVerificationEmailInput {
  to: string;
  name: string;
  verifyUrl: string;
}

export async function sendVerificationEmail({
  to,
  name,
  verifyUrl,
}: SendVerificationEmailInput) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST!,
    port: Number(process.env.SMTP_PORT),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER!,
      pass: process.env.SMTP_PASS!,
    },
  });

  const appName = "SMANS";
  const subject = `Verify your ${appName} account`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h1 style="color: #3b82f6; text-align: center;">Verify Your Email</h1>
      
      <p>Hello ${name},</p>
      
      <p>Thank you for signing up with ${appName}. Please click the button below to verify your email address:</p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${verifyUrl}"
           style="display: inline-block; background: #3b82f6; color: white; padding: 14px 32px; 
                  text-decoration: none; border-radius: 8px; font-size: 18px; font-weight: bold;">
          Verify Email
        </a>
      </div>
      
      <p style="font-size: 14px; color: #555;">
        This link will expire in 60 minutes.
        If you did not sign up, please ignore this email.
      </p>
      
      <p style="font-size: 14px; color: #777; text-align: center; margin-top: 40px;">
        Best regards,<br/>
        <strong>${appName} Team</strong>
      </p>
    </div>
  `;

  const text = `
Hello ${name},

Thank you for signing up with ${appName}.

Verify your email here: ${verifyUrl}

This link expires in 60 minutes.

If you did not sign up, ignore this email.

${appName} Team
  `.trim();

  try {
    await transporter.sendMail({
      from: `"${appName}" <${process.env.SMTP_FROM}>`,
      to,
      subject,
      html,
      text,
    });

    console.log(`Verification email sent to ${to}`);
  } catch (err) {
    console.error("Failed to send verification email:", err);
    throw new Error("Failed to send verification email");
  }
}