import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export class EmailService {
  static async sendWelcome(email: string, name: string) {
    await transporter.sendMail({
      from: `"SMANS" <${process.env.SMTP_FROM}>`,
      to: email,
      subject: "Welcome to SMANS School Management System",
      html: `
        <h1>Welcome, ${name}!</h1>
        <p>Your account has been created successfully.</p>
        <p>Login at: ${process.env.NEXTAUTH_URL}/auth/login</p>
      `,
    });
  }

  static async sendInvoice(email: string, invoiceId: string) {
    await transporter.sendMail({
      from: `"SMANS" <${process.env.SMTP_FROM}>`,
      to: email,
      subject: "New Invoice Generated",
      html: `<p>Invoice ${invoiceId} has been generated. Please check your dashboard.</p>`,
    });
  }
}