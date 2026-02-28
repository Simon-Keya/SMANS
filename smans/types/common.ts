// types/common.ts
export type ID = string;

export interface Timestamps {
  createdAt: Date;
  updatedAt: Date;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface SelectOption {
  value: string;
  label: string;
}