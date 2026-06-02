import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Alert } from 'react-native';

import { deleteAllNotificationsApi } from '@/api/notification';
import { syncBadgeCount } from '@/lib/pushNotifications';

export function useDeleteAllNotificationsMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteAllNotificationsApi,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['notifications'] });
      void syncBadgeCount();
    },
    onError: () => {
      Alert.alert('삭제 실패', '알림을 삭제하지 못했어요. 잠시 후 다시 시도해주세요.');
    },
  });
}
