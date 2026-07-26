import { useQuery } from '@tanstack/react-query';

import { getChatMessagesApi } from '@/services/chat';
import useAuthStore, { useIsLoggedIn } from '@/store/useAuthStore';
import { chatKeys } from '@/queries/keys';

export function useChatMessagesQuery(chatId: number) {
  const isLoggedIn = useIsLoggedIn();

  return useQuery({
    queryKey: chatKeys.messages(chatId),
    queryFn: () => {
      const token = useAuthStore.getState().accessToken;
      if (!token) throw new Error('로그인이 필요합니다.');
      return getChatMessagesApi(chatId, token);
    },
    select: (response) => response.data,
    enabled: chatId > 0 && isLoggedIn,
  });
}
