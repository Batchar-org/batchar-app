import { apiFetch } from './client';
import type {
  LoginRequest,
  LoginResponse,
  LogoutRequest,
  LogoutResponse,
  RefreshRequest,
  RefreshResponse,
  SendEmailCodeRequest,
  SendEmailCodeResponse,
  SignupRequest,
  SignupResponse,
  VerifyEmailCodeRequest,
  VerifyEmailCodeResponse,
} from './types';

export function loginApi(body: LoginRequest) {
  return apiFetch<LoginResponse>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function signupApi(body: SignupRequest) {
  return apiFetch<SignupResponse>('/api/auth/signup', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function sendEmailCodeApi(body: SendEmailCodeRequest) {
  return apiFetch<SendEmailCodeResponse>('/api/auth/email/send', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function verifyEmailCodeApi(body: VerifyEmailCodeRequest) {
  return apiFetch<VerifyEmailCodeResponse>('/api/auth/email/verify', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function refreshApi(body: RefreshRequest) {
  return apiFetch<RefreshResponse>('/api/auth/refresh', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function logoutApi(body: LogoutRequest) {
  return apiFetch<LogoutResponse>('/api/auth/logout', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}
