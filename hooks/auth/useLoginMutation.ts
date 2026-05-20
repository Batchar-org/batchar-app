import { useMutation } from '@tanstack/react-query';
import { loginApi } from '@/api/auth';
import { setStoredUserId, setStoredUserName } from '@/lib/secureStore';
import { useAuthActions } from '@/store/useAuthStore';

export function useLoginMutation() {
  const { setSession } = useAuthActions();

  return useMutation({
    mutationFn: loginApi,
    onSuccess: async (response) => {
      const { userId, accessToken } = response.data;
      // Supabase 클라이언트가 access/refresh 토큰을 SecureStore adapter로 자동 관리하므로
      // 여기서는 라우팅 복원에 필요한 userId / userName 만 추가로 저장합니다.
      await setStoredUserId(userId);
      setSession({ userId, accessToken });
    },
  });
}

// userName은 로그인 응답에 없으므로 프로필 조회 후 별도 저장합니다.
export { setStoredUserName };
