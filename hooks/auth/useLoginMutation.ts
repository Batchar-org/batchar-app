import { useMutation } from '@tanstack/react-query';
import { loginApi } from '@/api/auth';
import { setRefreshToken, setStoredUserId, setStoredUserName } from '@/lib/secureStore';
import { useAuthActions } from '@/store/useAuthStore';

function readStringCandidate(source: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = source[key];

    if (typeof value === 'string' && value.trim()) {
      return value;
    }
  }

  return null;
}

function readNumberCandidate(source: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = source[key];

    if (typeof value === 'number') {
      return value;
    }
  }

  return null;
}

export function useLoginMutation() {
  const { setSession } = useAuthActions();

  return useMutation({
    mutationFn: loginApi,
    onSuccess: async (response) => {
      const responseRecord = response as Record<string, unknown>;
      const nestedData =
        responseRecord.data && typeof responseRecord.data === 'object'
          ? (responseRecord.data as Record<string, unknown>)
          : null;

      // Swagger 응답과 실제 응답 키가 다를 수 있어 여러 후보를 순서대로 확인합니다.
      const accessToken =
        (nestedData && readStringCandidate(nestedData, ['accessToken', 'access_token'])) ??
        readStringCandidate(responseRecord, ['accessToken', 'access_token']);

      const refreshToken =
        (nestedData && readStringCandidate(nestedData, ['refreshToken', 'refresh_token'])) ??
        readStringCandidate(responseRecord, ['refreshToken', 'refresh_token']);

      const userId =
        (nestedData && readNumberCandidate(nestedData, ['userId', 'user_id'])) ??
        readNumberCandidate(responseRecord, ['userId', 'user_id']);

      // 토큰 형식이 맞지 않으면 저장 전에 명확한 에러로 중단합니다.
      if (!accessToken) {
        console.log('invalid login accessToken', response);
        throw new Error('로그인 응답의 accessToken 형식이 올바르지 않습니다.');
      }

      if (!refreshToken) {
        console.log('invalid login refreshToken', response);
        throw new Error('로그인 응답의 refreshToken 형식이 올바르지 않습니다.');
      }

      if (typeof userId !== 'number') {
        console.log('invalid login userId', response);
        throw new Error('로그인 응답의 userId 형식이 올바르지 않습니다.');
      }

      const userName =
        (nestedData && readStringCandidate(nestedData, ['userName', 'user_name', 'name'])) ??
        readStringCandidate(responseRecord, ['userName', 'user_name', 'name']);

      // 로그인 성공 시 RT는 SecureStore, AT는 메모리 상태로 분리 저장합니다.
      await setRefreshToken(refreshToken);
      await setStoredUserId(userId);
      if (userName) await setStoredUserName(userName);
      setSession({ userId, accessToken, userName });
    },
  });
}
