import { apiFetch } from './client';
import type {
  CheckEmailDuplicateRequest,
  CheckEmailDuplicateResponse,
  CheckNicknameDuplicateRequest,
  CheckNicknameDuplicateResponse,
  LoginRequest,
  LoginResponse,
  LogoutRequest,
  LogoutResponse,
  PasswordResetRequest,
  PasswordResetResponse,
  RefreshRequest,
  RefreshResponse,
  SendEmailCodeRequest,
  SendEmailCodeResponse,
  SignupRequest,
  SignupResponse,
  VerifyEmailCodeRequest,
  VerifyEmailCodeResponse,
} from './types';

export function loginApi(body: LoginRequest): Promise<LoginResponse> {
  return apiFetch<LoginResponse>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function signupApi(body: SignupRequest): Promise<SignupResponse> {
  return apiFetch<SignupResponse>('/api/auth/signup', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function checkNicknameDuplicateApi({
  name,
}: CheckNicknameDuplicateRequest): Promise<CheckNicknameDuplicateResponse> {
  const params = new URLSearchParams({ name });
  return apiFetch<CheckNicknameDuplicateResponse>(
    `/api/users/name/duplicate?${params.toString()}`,
    { method: 'GET' }
  );
}

export function checkEmailDuplicateApi({
  email,
}: CheckEmailDuplicateRequest): Promise<CheckEmailDuplicateResponse> {
  const params = new URLSearchParams({ email });
  return apiFetch<CheckEmailDuplicateResponse>(`/api/users/email/duplicate?${params.toString()}`, {
    method: 'GET',
  });
}

export function sendEmailCodeApi(body: SendEmailCodeRequest): Promise<SendEmailCodeResponse> {
  // 서버는 { data: null, message } 를 반환한다. 그대로 전달한다.
  return apiFetch<SendEmailCodeResponse>('/api/auth/email/send', {
    method: 'POST',
    body: JSON.stringify({ email: body.email }),
  });
}

export function verifyEmailCodeApi(body: VerifyEmailCodeRequest): Promise<VerifyEmailCodeResponse> {
  return apiFetch<VerifyEmailCodeResponse>('/api/auth/email/verify', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function refreshApi(body: RefreshRequest): Promise<RefreshResponse> {
  return apiFetch<RefreshResponse>('/api/auth/refresh', {
    method: 'POST',
    body: JSON.stringify(body),
    // refresh는 access 토큰이 없거나 만료된 상태에서도 호출되므로 자동 Bearer 주입을 끈다.
    accessToken: null,
  });
}

export function resetPasswordApi(body: PasswordResetRequest): Promise<PasswordResetResponse> {
  return apiFetch<PasswordResetResponse>('/api/auth/password/reset', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function logoutApi(body: LogoutRequest): Promise<LogoutResponse> {
  // NestJS logout은 RT를 Refresh-Token 헤더로 받는다 (body 아님).
  return apiFetch<LogoutResponse>('/api/auth/logout', {
    method: 'POST',
    headers: { 'Refresh-Token': body.refreshToken },
  });
}
