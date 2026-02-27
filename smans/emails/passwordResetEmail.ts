// emails/passwordResetEmail.ts
/**
 * Password reset email - contains secure reset link
 */
export function getPasswordResetEmail(name: string, resetUrl: string, expiryMinutes = 60) {
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
  
          <p style="font-size: 16px; line-height: 1.6;">
            Click the button below to set a new password:
          </p>
  
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}"
               style="display: inline-block; background: #3b82f6; color: white; padding: 14px 32px; 
                      text-decoration: none; border-radius: 8px; font-size: 18px; font-weight: bold;">
              Reset Password
            </a>
          </div>
  
          <p style="font-size: 14px; color: #555;">
            This link will expire in ${expiryMinutes} minutes for security reasons.
            If you did not request a password reset, please ignore this email or contact support immediately.
          </p>
  
          <p style="font-size: 14px; color: #777; text-align: center; margin-top: 40px;">
            Best regards,<br/>
            <strong>SMANS Security Team</strong><br/>
            <small>School Management System - Nairobi</small>
          </p>
        </div>
      `,
      text: `
  Hello ${name},
  
  We received a request to reset your SMANS account password.
  
  Click here to set a new password: ${resetUrl}
  
  This link will expire in ${expiryMinutes} minutes.
  
  If you did not request this reset, please ignore this email or contact support.
  
  Best regards,
  SMANS Security Team
  School Management System - Nairobi
      `.trim(),
    };
  }