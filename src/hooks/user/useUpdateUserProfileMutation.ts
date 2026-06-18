import { useMutation, useQueryClient } from '@tanstack/react-query';

import { updateUserProfileApi } from '@/services/user';
import type { UpdateUserProfileRequest } from '@/types';
import useAuthStore from '@/store/useAuthStore';

export function useUpdateUserProfileMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: UpdateUserProfileRequest) => {
      const token = useAuthStore.getState().accessToken;
      if (!token) throw new Error('인증 토큰이 없습니다.');
      return updateUserProfileApi(body, token);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
    },
  });
}
