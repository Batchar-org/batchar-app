import { useQuery } from '@tanstack/react-query';

import { getNotificationSettingsApi } from '@/api/notification';
import useAuthStore, { useIsLoggedIn } from '@/store/useAuthStore';

export function useNotificationSettingsQuery() {
  const isLoggedIn = useIsLoggedIn();

  return useQuery({
    queryKey: ['notification-settings'],
    queryFn: () => {
      const token = useAuthStore.getState().accessToken;
      if (!token) throw new Error('로그인이 필요합니다.');
      return getNotificationSettingsApi();
    },
    select: (response) => response.data.push_enabled,
    enabled: isLoggedIn,
  });
}
