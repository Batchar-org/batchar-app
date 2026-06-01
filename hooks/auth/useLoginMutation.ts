import { useMutation } from '@tanstack/react-query';
import { loginApi } from '@/api/auth';
import { setRefreshToken, setStoredUserId, setStoredUserName } from '@/lib/secureStore';
import { useAuthActions } from '@/store/useAuthStore';

export function useLoginMutation() {
  const { setSession } = useAuthActions();

  return useMutation({
    mutationFn: loginApi,
    onSuccess: async (response) => {
      // 응답 키는 snake_case (NestJS SnakeCaseInterceptor)
      const { user_id, access_token, refresh_token } = response.data;
      // refresh 토큰 + userId를 영속 저장(앱 재실행 시 세션 복구용), access 토큰은 메모리에 둔다.
      await setRefreshToken(refresh_token);
      await setStoredUserId(user_id);
      setSession({ userId: user_id, accessToken: access_token });
    },
  });
}

// userName은 로그인 응답에 없으므로 프로필 조회 후 별도 저장합니다.
export { setStoredUserName };
