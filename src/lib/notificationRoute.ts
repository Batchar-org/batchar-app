import type { NotificationData } from '@/types';

// 알림 data로부터 딥링크 경로를 만든다. 특정 대상이 없는 알림(report 등)은 null을 반환한다.
// 리스너(푸시 탭)와 알림함 화면이 동일한 라우팅 로직을 공유하기 위한 단일 소스.
export function buildNotificationRoute(data: NotificationData | null | undefined): string | null {
  if (!data?.category) return null;
  switch (data.category) {
    case 'chat':
      return data.chat_id != null ? `/chat/${data.chat_id}` : null;
    case 'bid':
    case 'outbid':
    case 'auction':
      return data.product_id != null ? `/product/${data.product_id}` : null;
    default:
      return null; // report 등 대상이 없는 알림
  }
}
