import { useMutation, useQueryClient } from '@tanstack/react-query';

import { leaveChatApi } from '@/api/chat';
import { ChatLeaveResponse } from '@/api/types';
import { useAccessToken } from '@/store/useAuthStore';

export function useLeaveChatMutation() {
  const accessToken = useAccessToken();
  const queryClient = useQueryClient();

  return useMutation<ChatLeaveResponse, Error, number>({
    mutationFn: async (chatId: number) => {
      if (!accessToken) {
        throw new Error('로그인이 필요합니다.');
      }
      return leaveChatApi(chatId, accessToken);
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chatList'] });
    },
  });
}
