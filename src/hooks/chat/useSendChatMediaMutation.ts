import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ImagePickerAsset } from 'expo-image-picker';

import { sendChatMediaApi } from '@/services/chat';
import { ChatMessageSendResponse } from '@/types';
import { useAccessToken } from '@/store/useAuthStore';
import { chatKeys } from '@/queries/keys';

type SendChatMediaParams = {
  chatId: number;
  file: ImagePickerAsset;
};

export function useSendChatMediaMutation() {
  const accessToken = useAccessToken();
  const queryClient = useQueryClient();

  return useMutation<ChatMessageSendResponse, Error, SendChatMediaParams>({
    mutationFn: async ({ chatId, file }) => {
      if (!accessToken) {
        throw new Error('로그인이 필요합니다.');
      }
      return sendChatMediaApi(chatId, file, accessToken);
    },

    onSuccess: (_data, { chatId }) => {
      queryClient.invalidateQueries({ queryKey: chatKeys.messages(chatId) });
      queryClient.invalidateQueries({ queryKey: chatKeys.list });
    },
  });
}
