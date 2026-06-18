import type { ApiResponse } from '@/types/common';

// 클라이언트 딥링크 분기에 쓰는 카테고리(5종). 서버 type(8종)은 표시용.
export type NotificationCategory = 'chat' | 'bid' | 'outbid' | 'auction' | 'report';

export type NotificationType =
  | 'CHAT'
  | 'BID'
  | 'OUTBID'
  | 'AUCTION_WON'
  | 'AUCTION_SOLD'
  | 'AUCTION_LOST'
  | 'AUCTION_FAILED'
  | 'REPORT_CREATED'
  | 'REPORT_RESOLVED';

// 푸시 payload와 알림함 응답 모두 동일한 snake_case 형태로 전달된다.
export type NotificationData = {
  category: NotificationCategory;
  chat_id?: number;
  product_id?: number;
  report_id?: number;
};

export type NotificationItem = {
  id: number;
  type: NotificationType;
  title: string;
  body: string;
  data: NotificationData | null;
  is_read: boolean;
  created_at: string;
};

export type NotificationListResponse = ApiResponse<{
  content: NotificationItem[];
  has_next: boolean;
}>;

export type UnreadCountResponse = ApiResponse<{ count: number }>;

export type NotificationSettingResponse = ApiResponse<{ push_enabled: boolean }>;
