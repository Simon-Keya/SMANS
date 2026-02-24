// emails/invoice.ts
export function getInvoiceEmail(studentName: string, invoiceId: string, amount: number, dueDate: string) {
    return {
      subject: `New Invoice #${invoiceId} - SMANS`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px;">
          <h1 style="color: #ef4444;">Invoice Generated</h1>
          <p>Dear ${studentName},</p>
          <p>A new invoice has been generated for your account:</p>
          <ul>
            <li><strong>Invoice ID:</strong> ${invoiceId}</li>
            <li><strong>Amount:</strong> KES ${amount.toLocaleString()}</li>
            <li><strong>Due Date:</strong> ${dueDate}</li>
          </ul>
          <p>Please log in to your parent dashboard to view and pay.</p>
          <p style="text-align: center;">
            <a href="${process.env.NEXTAUTH_URL}/dashboard/parent/invoices" style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
              View Invoice
            </a>
          </p>
          <p>Thank you for your prompt payment.</p>
          <p>SMANS Finance Team</p>
        </div>
      `,
    };
  }