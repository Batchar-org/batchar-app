import { useMutation, useQueryClient } from '@tanstack/react-query';

import { markNotificationReadApi } from '@/services/notification';
import { syncBadgeCount } from '@/lib/pushNotifications';
import { notificationKeys } from '@/queries/keys';

export function useMarkNotificationReadMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => markNotificationReadApi(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: notificationKeys.all });
      await syncBadgeCount();
    },
  });
}
