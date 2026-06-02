import { useMutation, useQueryClient } from '@tanstack/react-query';

import { markAllNotificationsReadApi } from '@/api/notification';
import { syncBadgeCount } from '@/lib/pushNotifications';

export function useMarkAllNotificationsReadMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markAllNotificationsReadApi,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['notifications'] });
      await syncBadgeCount();
    },
  });
}
