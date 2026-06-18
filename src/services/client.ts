import useAuthStore from '@/store/useAuthStore';
import {
  getRefreshToken,
  removeRefreshToken,
  removeStoredUserId,
  removeStoredUserName,
  setRefreshToken,
} from '@/lib/secureStore';
import { ApiError } from './errors';

// Expo public env는 번들 시점에 주입되므로 변경 후 Metro 재시작이 필요합니다.
const BASE_URL = (process.env.EXPO_PUBLIC_API_BASE_URL ?? '').trim().replace(/\/+$/, '');

type ApiFetchOptions = RequestInit & {
  // 토큰을 명시적으로 넘기면 그 값을 쓰고, 생략하면 스토어의 accessToken을 자동 주입한다.
  accessToken?: string | null;
};

function resolveToken(options: ApiFetchOptions): string | null {
  if (options.accessToken !== undefined) return options.accessToken;
  return useAuthStore.getState().accessToken;
}

function buildHeaders(options: ApiFetchOptions, token: string | null): Headers {
  const headers = new Headers(options.headers);
  headers.set('Accept', 'application/json');
  // FormData(멀티파트)는 boundary를 런타임이 직접 설정하므로 Content-Type을 건드리지 않는다.
  if (options.body && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }
  if (token) headers.set('Authorization', `Bearer ${token}`);
  return headers;
}

async function parseBody(response: Response): Promise<any> {
  const contentType = response.headers.get('content-type');
  return contentType?.includes('application/json') ? await response.json() : null;
}

function toApiError(body: any, status: number): ApiError {
  // NestJS 에러 봉투: { code, message, details? }
  return new ApiError(body?.message ?? `요청에 실패했습니다. status=${status}`, {
    code: body?.code,
    status,
    details: body?.details,
  });
}

function isSuspendedError(body: any): boolean {
  return body?.code === 'USER_SUSPENDED';
}

// 동시 401에 대해 refresh는 한 번만 수행 (single-flight)
let refreshPromise: Promise<string> | null = null;

async function runRefresh(): Promise<string> {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      const refreshToken = await getRefreshToken();
      if (!refreshToken) {
        throw new ApiError('세션이 만료되었습니다. 다시 로그인해 주세요.', {
          code: 'INVALID_TOKEN',
          status: 401,
        });
      }
      // 재귀(apiFetch) 방지를 위해 직접 fetch로 호출한다.
      const response = await fetch(`${BASE_URL}/api/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });
      const body = await parseBody(response);
      if (!response.ok) {
        throw toApiError(body, response.status);
      }
      // 응답 키는 snake_case (access_token / refresh_token)
      const accessToken: string = body?.data?.access_token;
      const newRefreshToken: string = body?.data?.refresh_token;
      // refresh 토큰 회전: 항상 최신 값으로 덮어쓴다.
      await setRefreshToken(newRefreshToken);
      useAuthStore.getState().actions.setAccessToken(accessToken);
      return accessToken;
    })().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

async function clearSessionHard() {
  await removeRefreshToken();
  await removeStoredUserId();
  await removeStoredUserName();
  useAuthStore.getState().actions.clearSession();
}

// refresh 자체나 로그인/회원가입은 401이어도 재시도(refresh)하지 않는다.
const NO_REFRESH_PATHS = ['/api/auth/refresh', '/api/auth/login', '/api/auth/signup'];

export async function apiFetch<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  if (!BASE_URL) {
    throw new ApiError(
      'EXPO_PUBLIC_API_BASE_URL이 설정되지 않았습니다. .env 확인 후 Metro 서버를 재시작해 주세요.'
    );
  }

  const token = resolveToken(options);
  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: buildHeaders(options, token),
  });

  // 보호 엔드포인트에서 401을 받으면 refresh 후 1회 재시도한다.
  if (response.status === 401 && !NO_REFRESH_PATHS.some((p) => path.startsWith(p))) {
    try {
      const newToken = await runRefresh();
      const retry = await fetch(`${BASE_URL}${path}`, {
        ...options,
        headers: buildHeaders(options, newToken),
      });
      const retryBody = await parseBody(retry);
      if (isSuspendedError(retryBody)) {
        await clearSessionHard();
      }
      if (!retry.ok) {
        throw toApiError(retryBody, retry.status);
      }
      return retryBody as T;
    } catch (error) {
      await clearSessionHard();
      throw error instanceof ApiError
        ? error
        : new ApiError('세션이 만료되었습니다. 다시 로그인해 주세요.', {
            code: 'INVALID_TOKEN',
            status: 401,
          });
    }
  }

  const body = await parseBody(response);
  if (isSuspendedError(body)) {
    await clearSessionHard();
  }
  if (!response.ok) {
    throw toApiError(body, response.status);
  }
  return body as T;
}
