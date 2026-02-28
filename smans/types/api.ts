// types/api.ts
export interface ApiError {
    error: string;
    message?: string;
    status?: number;
  }
  
  export interface ApiSuccess<T> {
    success: true;
    data: T;
  }
  
  export type ApiResponse<T> = ApiSuccess<T> | ApiError;