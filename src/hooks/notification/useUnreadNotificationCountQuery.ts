import { useQuery } from '@tanstack/react-query';

import { getUnreadNotificationCountApi } from '@/services/notification';
import useAuthStore, { useIsLoggedIn } from '@/store/useAuthStore';

export function useUnreadNotificationCountQuery() {
  const isLoggedIn = useIsLoggedIn();

  return useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: () => {
      const token = useAuthStore.getState().accessToken;
      if (!token) throw new Error('로그인이 필요합니다.');
      return getUnreadNotificationCountApi();
    },
    select: (response) => response.data.count,
    enabled: isLoggedIn,
  });
}
