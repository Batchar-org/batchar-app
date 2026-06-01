export type ApiErrorDetail = { field: string; message: string };

export class ApiError extends Error {
  status?: number;
  code?: string;
  details?: ApiErrorDetail[];

  constructor(
    message: string,
    opts?: { code?: string; status?: number; details?: ApiErrorDetail[] }
  ) {
    super(message);
    this.name = 'ApiError';
    this.code = opts?.code;
    this.status = opts?.status;
    this.details = opts?.details;
  }
}
