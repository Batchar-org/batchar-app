import { useMutation, useQueryClient } from '@tanstack/react-query';

import { updateProfileImageApi } from '@/services/user';
import useAuthStore from '@/store/useAuthStore';

export function useUpdateProfileImageMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (imageUri: string) => {
      const token = useAuthStore.getState().accessToken;
      if (!token) throw new Error('인증 토큰이 없습니다.');
      return updateProfileImageApi(imageUri, token);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
    },
  });
}
