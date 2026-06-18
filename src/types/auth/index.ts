import type { ApiResponse } from '@/types/common';

export type LoginRequest = {
  email: string;
  password: string;
};

export type SignupRequest = {
  email: string;
  password: string;
  name: string;
  address: string;
};

export type CheckNicknameDuplicateRequest = {
  name: string;
};

export type SendEmailCodeRequest = {
  email: string;
};

export type VerifyEmailCodeRequest = {
  email: string;
  code: string;
};

export type RefreshRequest = {
  refreshToken: string;
};

export type LogoutRequest = {
  refreshToken: string;
};

// 응답 키는 snake_case (NestJS SnakeCaseInterceptor). userId는 number(bigint).
export type AuthTokenPayload = {
  user_id: number;
  access_token: string;
  refresh_token: string;
};

export type LoginResponse = ApiResponse<AuthTokenPayload>;
export type SignupResponse = ApiResponse<AuthTokenPayload>;

export type RefreshResponse = ApiResponse<{
  access_token: string;
  refresh_token: string;
}>;

export type SendEmailCodeResponse = ApiResponse<null>;
export type CheckNicknameDuplicateResponse = ApiResponse<null>;
export type CheckEmailDuplicateRequest = {
  email: string;
};
export type CheckEmailDuplicateResponse = ApiResponse<null>;

export type VerifyEmailCodeResponse = ApiResponse<{
  email: string;
}>;

export type LogoutResponse = ApiResponse<string>;

export type PasswordResetRequest = {
  email: string;
};

export type PasswordResetResponse = ApiResponse<null>;
