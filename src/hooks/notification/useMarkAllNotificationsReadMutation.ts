import { useMutation, useQueryClient } from '@tanstack/react-query';

import { markAllNotificationsReadApi } from '@/services/notification';
import { syncBadgeCount } from '@/lib/pushNotifications';
import { notificationKeys } from '@/queries/keys';

export function useMarkAllNotificationsReadMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markAllNotificationsReadApi,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: notificationKeys.all });
      await syncBadgeCount();
    },
  });
}
