import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Alert } from 'react-native';

import { deleteNotificationApi } from '@/services/notification';
import { syncBadgeCount } from '@/lib/pushNotifications';
import type { NotificationListResponse } from '@/types';
import { notificationKeys } from '@/queries/keys';

type NotificationsCache = { pages: NotificationListResponse[]; pageParams: unknown[] };

export function useDeleteNotificationMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteNotificationApi(id),
    // 스와이프 삭제가 즉시 반영되도록 캐시에서 먼저 제거(낙관적 업데이트)
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: notificationKeys.all });
      const previous = queryClient.getQueryData<NotificationsCache>(notificationKeys.all);
      queryClient.setQueryData<NotificationsCache>(notificationKeys.all, (old) =>
        old
          ? {
              ...old,
              pages: old.pages.map((page) => ({
                ...page,
                data: {
                  ...page.data,
                  content: page.data.content.filter((n) => n.id !== id),
                },
              })),
            }
          : old
      );
      return { previous };
    },
    onError: (error, _id, context) => {
      // 404(이미 삭제됨)는 제거 상태를 유지, 그 외 오류는 롤백 + 안내
      if ((error as { status?: number }).status === 404) return;
      if (context?.previous) {
        queryClient.setQueryData(notificationKeys.all, context.previous);
      }
      Alert.alert('삭제 실패', '알림을 삭제하지 못했어요. 잠시 후 다시 시도해주세요.');
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: notificationKeys.all });
      void syncBadgeCount();
    },
  });
}
