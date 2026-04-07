import { useQuery } from '@tanstack/react-query';

import { getChatMessagesApi } from '../../api/chat';
import useAuthStore, { useIsLoggedIn } from '../../store/useAuthStore';

export function useChatMessagesQuery(chatId: number) {
  const isLoggedIn = useIsLoggedIn();

  return useQuery({
    queryKey: ['chatMessages', chatId],
    queryFn: () => {
      const token = useAuthStore.getState().accessToken;
      if (!token) throw new Error('로그인이 필요합니다.');
      return getChatMessagesApi(chatId, token);
    },
    select: (response) => response.data,
    enabled: chatId > 0 && isLoggedIn,
  });
}
