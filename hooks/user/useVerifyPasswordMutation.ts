import { useMutation } from '@tanstack/react-query';

import { verifyPasswordApi } from '@/api/user';
import type { PasswordVerifyRequest } from '@/api/types';
import useAuthStore from '@/store/useAuthStore';

export function useVerifyPasswordMutation() {
  return useMutation({
    mutationFn: (body: PasswordVerifyRequest) => {
      const token = useAuthStore.getState().accessToken;
      if (!token) throw new Error('인증 토큰이 없습니다.');
      return verifyPasswordApi(body, token);
    },
  });
}
