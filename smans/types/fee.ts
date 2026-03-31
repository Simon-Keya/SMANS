// types/fee.ts
export type FeeFrequency = 'ONCE' | 'TERM' | 'YEARLY' | 'MONTHLY';

export interface FeeItemBase {
  id: string;
  name: string;                    // e.g., "Tuition Fee", "Exam Fee", "Activity Fee"
  amount: number;
  frequency: FeeFrequency;
  description?: string | null;
  isMandatory: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface InvoiceBase {
  id: string;
  studentId: string;
  feeItemId?: string | null;
  amount: number;
  dueDate: Date;
  status: 'PENDING' | 'PARTIAL' | 'PAID' | 'OVERDUE';
  description?: string | null;
  createdById: string;
  approvedById?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaymentBase {
  id: string;
  invoiceId: string;
  amount: number;
  method: string;                  // e.g., "MPESA", "Bank", "Cash"
  transactionCode?: string | null;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  paymentDate: Date;
  createdById: string;
  approvedById?: string | null;
}