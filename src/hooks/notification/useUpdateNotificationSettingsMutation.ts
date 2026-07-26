import { useMutation, useQueryClient } from '@tanstack/react-query';

import { updateNotificationSettingsApi } from '@/services/notification';
import { notificationKeys } from '@/queries/keys';

export function useUpdateNotificationSettingsMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (pushEnabled: boolean) => updateNotificationSettingsApi(pushEnabled),
    // PATCH 응답이 곧 최신 설정이므로 캐시에 바로 반영해 토글이 즉시 갱신되게 한다.
    onSuccess: (response) => {
      queryClient.setQueryData(notificationKeys.settings, response);
    },
  });
}
