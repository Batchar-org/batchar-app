import { useQuery } from '@tanstack/react-query';

import { getChatListApi } from '../../api/chat';
import useAuthStore, { useIsLoggedIn } from '../../store/useAuthStore';

export function useChatListQuery() {
  const isLoggedIn = useIsLoggedIn();

  return useQuery({
    queryKey: ['chatList'],
    queryFn: () => {
      const token = useAuthStore.getState().accessToken;
      if (!token) throw new Error('로그인이 필요합니다.');
      return getChatListApi(token);
    },
    select: (response) => response.data,
    enabled: isLoggedIn,
  });
}
