import { useMutation, useQueryClient } from '@tanstack/react-query';

import { deleteProfileImageApi } from '@/api/user';
import useAuthStore from '@/store/useAuthStore';

export function useDeleteProfileImageMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => {
      const token = useAuthStore.getState().accessToken;
      if (!token) throw new Error('인증 토큰이 없습니다.');
      return deleteProfileImageApi(token);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
    },
  });
}
