export type ApiResponse<T> = {
  data: T;
  message: string;
};

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

export type AuthTokenPayload = {
  userId: number;
  accessToken: string;
  refreshToken: string;
};

export type LoginResponse = ApiResponse<AuthTokenPayload>;
export type SignupResponse = ApiResponse<AuthTokenPayload>;

export type RefreshResponse = ApiResponse<{
  accessToken: string;
  refreshToken: string;
}>;

export type SendEmailCodeResponse = ApiResponse<string>;
export type CheckNicknameDuplicateResponse = ApiResponse<null>;

export type VerifyEmailCodeResponse = ApiResponse<{
  email: string;
}>;

export type LogoutResponse = ApiResponse<string>;

// ── Product ──

export type ProductCreateRequest = {
  title: string;
  description: string;
  category: string;
  startPrice: number;
  endTime: string;
};

export type ProductCreateResponse = ApiResponse<{ product_id: number }>;
