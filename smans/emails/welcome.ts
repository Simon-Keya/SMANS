// emails/welcome.ts
export function getWelcomeEmail(name: string, loginUrl: string) {
    return {
      subject: "Welcome to SMANS School Management System",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #10b981;">Welcome, ${name}!</h1>
          <p>Your account has been successfully created.</p>
          <p>You can now log in at:</p>
          <p style="text-align: center;">
            <a href="${loginUrl}" style="background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Log In Now
            </a>
          </p>
          <p>If you didn't create this account, please contact the school admin.</p>
          <p>Best regards,<br/>SMANS Team</p>
        </div>
      `,
    };
  }