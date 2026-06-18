import { useMutation, useQueryClient } from '@tanstack/react-query';

import { completeDealApi } from '@/services/chat';
import { ChatCompleteDealResponse } from '@/types';
import { useAccessToken } from '@/store/useAuthStore';

export function useCompleteDealMutation() {
  const accessToken = useAccessToken();
  const queryClient = useQueryClient();

  return useMutation<ChatCompleteDealResponse, Error, number>({
    mutationFn: async (chatId: number) => {
      if (!accessToken) {
        throw new Error('로그인이 필요합니다.');
      }
      return completeDealApi(chatId, accessToken);
    },

    onSuccess: (_data, chatId) => {
      queryClient.invalidateQueries({ queryKey: ['chatMessages', chatId] });
      queryClient.invalidateQueries({ queryKey: ['chatList'] });
      queryClient.invalidateQueries({ queryKey: ['product'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}
