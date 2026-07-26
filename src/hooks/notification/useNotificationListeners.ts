import { useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import * as Notifications from 'expo-notifications';
import { useRouter, useRootNavigationState } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';

import useAuthStore, { useIsInitialized, useIsLoggedIn } from '@/store/useAuthStore';
import { syncBadgeCount } from '@/lib/pushNotifications';
import { buildNotificationRoute } from '@/lib/notificationRoute';
import type { NotificationData } from '@/types';
import { notificationKeys } from '@/queries/keys';

// 푸시 수신/탭/콜드스타트 처리 + 포그라운드 배지 동기화. 루트(RouteGuard)에서 1회 호출한다.
export function useNotificationListeners() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const isInitialized = useIsInitialized();
  const isLoggedIn = useIsLoggedIn();
  const navKey = useRootNavigationState()?.key;
  const ready = isInitialized && isLoggedIn && !!navKey;

  // 탭한 알림의 딥링크 경로를 보관했다가, 네비게이터/인증이 준비된 뒤 1회만 소비한다.
  const [pendingRoute, setPendingRoute] = useState<string | null>(null);
  const processedIds = useRef<Set<string>>(new Set());

  // 수신/탭 리스너 (마운트 시 1회 등록)
  useEffect(() => {
    const queueResponse = (response: Notifications.NotificationResponse) => {
      // 콜드스타트 응답이 getLastNotificationResponseAsync와 리스너 양쪽에서 중복 전달되는 것을 방지
      const id = response.notification.request.identifier;
      if (processedIds.current.has(id)) return;
      processedIds.current.add(id);

      const data = response.notification.request.content.data as NotificationData;
      // report 등 대상이 없는 알림은 알림함으로 보낸다.
      setPendingRoute(buildNotificationRoute(data) ?? '/mypage/notifications');
    };

    // 콜드 스타트: 종료 상태에서 푸시를 탭해 앱이 켜진 경우
    void Notifications.getLastNotificationResponseAsync().then((response) => {
      if (response) queueResponse(response);
    });

    // 백그라운드 상태에서 푸시 탭
    const responseSub = Notifications.addNotificationResponseReceivedListener(queueResponse);

    // 포그라운드 수신 → 알림함/미읽음 갱신 + 배지 동기화
    const receivedSub = Notifications.addNotificationReceivedListener(() => {
      void queryClient.invalidateQueries({ queryKey: notificationKeys.all });
      void syncBadgeCount();
    });

    // 앱이 포그라운드로 돌아올 때 배지 재동기화 (다른 기기/세션에서 읽은 경우 등)
    const appStateSub = AppState.addEventListener('change', (state) => {
      if (state === 'active' && useAuthStore.getState().status === 'authenticated') {
        void syncBadgeCount();
      }
    });

    return () => {
      responseSub.remove();
      receivedSub.remove();
      appStateSub.remove();
    };
  }, [queryClient]);

  // 네비게이터/인증이 준비된 뒤에만 딥링크를 소비한다(조기/중복 라우팅 방지).
  useEffect(() => {
    if (ready && pendingRoute) {
      const route = pendingRoute;
      setPendingRoute(null);
      router.push(route);
    }
  }, [ready, pendingRoute, router]);
}
