import { useQuery } from '@tanstack/react-query';

import { getChatListApi } from '@/services/chat';
import useAuthStore, { useIsLoggedIn } from '@/store/useAuthStore';
import { chatKeys } from '@/queries/keys';

export function useChatListQuery() {
  const isLoggedIn = useIsLoggedIn();

  return useQuery({
    queryKey: chatKeys.list,
    queryFn: () => {
      const token = useAuthStore.getState().accessToken;
      if (!token) throw new Error('로그인이 필요합니다.');
      return getChatListApi(token);
    },
    select: (response) => response.data,
    enabled: isLoggedIn,
  });
}
