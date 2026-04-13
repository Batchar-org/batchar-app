import { useMutation } from '@tanstack/react-query';

import { deleteUserApi } from '@/api/user';
import useAuthStore from '@/store/useAuthStore';
import { getRefreshToken } from '@/lib/secureStore';

export function useDeleteUserMutation() {
  return useMutation({
    mutationFn: async () => {
      const token = useAuthStore.getState().accessToken;
      if (!token) throw new Error('인증 토큰이 없습니다.');
      const refreshToken = await getRefreshToken();
      if (!refreshToken) throw new Error('Refresh Token이 없습니다.');
      return deleteUserApi(token, refreshToken);
    },
  });
}
