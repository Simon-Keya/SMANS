// types/fee.ts
export type InvoiceStatus = 'PENDING' | 'PAID' | 'PARTIAL' | 'OVERDUE';

export interface FeeItem {
  id: string;
  name: string;
  amount: number;
  frequency: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Invoice {
  id: string;
  studentId: string;
  feeItemId: string | null;
  amount: number;
  dueDate: Date;
  status: InvoiceStatus;
  createdAt: Date;
  updatedAt: Date;
}