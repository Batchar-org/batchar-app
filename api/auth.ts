import { supabase } from '@/lib/supabase';
import { ApiError, mapSupabaseAuthError, throwFromEdgeFunction } from './errors';
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

async function invokeEdgeFunction<T>(name: string, body: Record<string, unknown>): Promise<T> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const headers: Record<string, string> = {};
  if (session?.access_token) {
    headers.Authorization = `Bearer ${session.access_token}`;
  }
  const { data, error } = await supabase.functions.invoke<T>(name, {
    body,
    headers,
  });

  if (error) {
    let payload: unknown = null;
    if ((error as { context?: { json?: () => Promise<unknown> } }).context?.json) {
      try {
        payload = await (error as { context: { json: () => Promise<unknown> } }).context.json();
      } catch {
        payload = null;
      }
    }
    const status = (error as { status?: number }).status ?? 500;
    throwFromEdgeFunction(payload, status);
  }

  if (data === null || data === undefined) {
    throw new ApiError(`Edge Function ${name} 응답이 비어 있습니다.`);
  }

  return data;
}

export async function loginApi(body: LoginRequest): Promise<LoginResponse> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: body.email,
    password: body.password,
  });

  if (error || !data.session || !data.user) {
    throw mapSupabaseAuthError(error?.message ?? '로그인에 실패했습니다.', error?.status);
  }

  return {
    data: {
      userId: data.user.id,
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token,
    },
    message: '로그인 성공',
  };
}

export async function signupApi(body: SignupRequest): Promise<SignupResponse> {
  await invokeEdgeFunction<{ id: string; email: string; name: string }>('signup', {
    email: body.email,
    password: body.password,
    name: body.name,
    address: body.address,
  });

  return loginApi({ email: body.email, password: body.password }) as Promise<SignupResponse>;
}

export async function checkNicknameDuplicateApi({
  name,
}: CheckNicknameDuplicateRequest): Promise<CheckNicknameDuplicateResponse> {
  const { data, error } = await supabase.rpc('check_name_available', { p_name: name });
  if (error) {
    throw new ApiError(error.message, { code: error.code, status: 500 });
  }
  if (!data) {
    throw new ApiError('이미 사용 중인 닉네임입니다.', { code: 'DUPLICATE_NAME', status: 409 });
  }
  return { data: null, message: '사용 가능한 닉네임입니다.' };
}

export async function checkEmailDuplicateApi({
  email,
}: CheckEmailDuplicateRequest): Promise<CheckEmailDuplicateResponse> {
  const { data, error } = await supabase.rpc('check_email_available', { p_email: email });
  if (error) {
    throw new ApiError(error.message, { code: error.code, status: 500 });
  }
  if (!data) {
    throw new ApiError('이미 존재하는 이메일입니다.', { code: 'DUPLICATE_EMAIL', status: 409 });
  }
  return { data: null, message: '사용 가능한 이메일입니다.' };
}

export async function sendEmailCodeApi(body: SendEmailCodeRequest): Promise<SendEmailCodeResponse> {
  await invokeEdgeFunction<{ email: string }>('send-verify-code', { email: body.email });
  return { data: body.email, message: '인증 코드가 발송되었습니다.' };
}

export async function verifyEmailCodeApi(
  body: VerifyEmailCodeRequest
): Promise<VerifyEmailCodeResponse> {
  const result = await invokeEdgeFunction<{ email: string }>('verify-code', {
    email: body.email,
    code: body.code,
  });
  return { data: { email: result.email }, message: '이메일 인증이 완료되었습니다.' };
}

export async function refreshApi(_body: RefreshRequest): Promise<RefreshResponse> {
  const { data, error } = await supabase.auth.refreshSession();
  if (error || !data.session) {
    throw new ApiError(error?.message ?? '세션 갱신에 실패했습니다.', {
      code: 'INVALID_TOKEN',
      status: 401,
    });
  }
  return {
    data: {
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token,
    },
    message: '세션이 갱신되었습니다.',
  };
}

export async function resetPasswordApi(body: PasswordResetRequest): Promise<PasswordResetResponse> {
  await invokeEdgeFunction<{ email: string }>('reset-password', { email: body.email });
  return { data: null, message: '임시 비밀번호가 발송되었습니다.' };
}

export async function logoutApi(_body: LogoutRequest): Promise<LogoutResponse> {
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw new ApiError(error.message, { status: error.status });
  }
  return { data: '로그아웃 되었습니다.', message: '로그아웃 되었습니다.' };
}
