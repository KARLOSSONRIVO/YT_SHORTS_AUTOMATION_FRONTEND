export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: unknown;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code?: string;
    message: string;
    details?: {
      fieldErrors?: Record<string, string>;
      formErrors?: string[];
    } | Record<string, unknown>;
  };
}

export interface ApiErrorShape {
  message: string;
  code?: string;
  status?: number;
  fieldErrors?: Record<string, string>;
}
