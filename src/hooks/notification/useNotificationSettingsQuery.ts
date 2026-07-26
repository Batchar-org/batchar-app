import { useQuery } from '@tanstack/react-query';

import { getNotificationSettingsApi } from '@/services/notification';
import useAuthStore, { useIsLoggedIn } from '@/store/useAuthStore';
import { notificationKeys } from '@/queries/keys';

export function useNotificationSettingsQuery() {
  const isLoggedIn = useIsLoggedIn();

  return useQuery({
    queryKey: notificationKeys.settings,
    queryFn: () => {
      const token = useAuthStore.getState().accessToken;
      if (!token) throw new Error('로그인이 필요합니다.');
      return getNotificationSettingsApi();
    },
    select: (response) => response.data.push_enabled,
    enabled: isLoggedIn,
  });
}
