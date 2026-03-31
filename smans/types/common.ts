// types/common.ts
export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SelectOption {
  value: string;
  label: string;
}

export type Status = 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'COMPLETED' | 'CANCELLED';

export interface DateRange {
  from: Date;
  to: Date;
}

// Common metadata for audit logs
export interface AuditMetadata {
  [key: string]: any;
}