import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ImagePickerAsset } from 'expo-image-picker';

import { sendChatMediaApi } from '@/api/chat';
import { ChatMediaSendResponse } from '@/api/types';
import { useAccessToken } from '@/store/useAuthStore';

type SendChatMediaParams = {
  chatId: number;
  file: ImagePickerAsset;
};

export function useSendChatMediaMutation() {
  const accessToken = useAccessToken();
  const queryClient = useQueryClient();

  return useMutation<ChatMediaSendResponse, Error, SendChatMediaParams>({
    mutationFn: async ({ chatId, file }) => {
      if (!accessToken) {
        throw new Error('로그인이 필요합니다.');
      }
      return sendChatMediaApi(chatId, file, accessToken);
    },

    onSuccess: (_data, { chatId }) => {
      queryClient.invalidateQueries({ queryKey: ['chatMessages', chatId] });
      queryClient.invalidateQueries({ queryKey: ['chatList'] });
    },
  });
}
