import { useMutation, useQueryClient } from '@tanstack/react-query';

import { markNotificationReadApi } from '@/services/notification';
import { syncBadgeCount } from '@/lib/pushNotifications';

export function useMarkNotificationReadMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => markNotificationReadApi(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['notifications'] });
      await syncBadgeCount();
    },
  });
}
