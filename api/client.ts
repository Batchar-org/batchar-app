declare const process: {
  env: Record<string, string | undefined>;
};

// Expo public env는 번들 시점에 주입되므로 앱 재시작이 필요합니다.
const BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL?.trim() ?? '';

type ApiFetchOptions = RequestInit & {
  accessToken?: string | null;
};

export async function apiFetch<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  if (!BASE_URL) {
    throw new Error('EXPO_PUBLIC_API_BASE_URL이 없습니다. Metro 서버를 재시작해 주세요.');
  }

  const headers = new Headers(options.headers);
  // 중복 슬래시로 잘못된 URL이 만들어지지 않도록 정규화합니다.
  const normalizedBaseUrl = BASE_URL.replace(/\/+$/, '');

  if (options.body) {
    headers.set('Content-Type', 'application/json');
  }
  headers.set('Accept', 'application/json');

  if (options.accessToken) {
    headers.set('Authorization', `Bearer ${options.accessToken}`);
  }

  const response = await fetch(`${normalizedBaseUrl}${path}`, {
    ...options,
    headers,
  });

  const contentType = response.headers.get('content-type');
  const isJson = contentType?.includes('application/json');
  const data = isJson ? await response.json() : null;

  if (!response.ok) {
    const message = data?.message ?? `요청에 실패했습니다. status=${response.status}`;
    const error = new Error(message);
    (error as any).status = response.status;
    throw error;
  }

  return data as T;
}
