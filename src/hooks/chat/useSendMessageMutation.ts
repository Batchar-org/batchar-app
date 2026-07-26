import { useMutation, useQueryClient } from '@tanstack/react-query';

import { sendMessageApi } from '@/services/chat';
import { ChatMessageSendResponse } from '@/types';
import { useAccessToken } from '@/store/useAuthStore';
import { chatKeys } from '@/queries/keys';

type SendMessageParams = {
  chatId: number;
  message: string;
};

export function useSendMessageMutation() {
  const accessToken = useAccessToken();
  const queryClient = useQueryClient();

  return useMutation<ChatMessageSendResponse, Error, SendMessageParams>({
    mutationFn: async ({ chatId, message }) => {
      if (!accessToken) {
        throw new Error('로그인이 필요합니다.');
      }
      return sendMessageApi(chatId, { message }, accessToken);
    },

    onSuccess: (_data, { chatId }) => {
      queryClient.invalidateQueries({ queryKey: chatKeys.messages(chatId) });
      queryClient.invalidateQueries({ queryKey: chatKeys.list });
    },
  });
}
