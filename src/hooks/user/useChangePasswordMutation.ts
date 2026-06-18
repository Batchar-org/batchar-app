import { useMutation } from '@tanstack/react-query';

import { changePasswordApi } from '@/services/user';
import type { ChangePasswordRequest } from '@/types';
import useAuthStore from '@/store/useAuthStore';

export function useChangePasswordMutation() {
  return useMutation({
    mutationFn: (body: ChangePasswordRequest) => {
      const token = useAuthStore.getState().accessToken;
      if (!token) throw new Error('인증 토큰이 없습니다.');
      return changePasswordApi(body, token);
    },
  });
}
