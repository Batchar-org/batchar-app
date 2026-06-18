import type { ApiResponse } from '@/types/common';

export type ChatListItem = {
  chat_id: number;
  product_id: number;
  partner_id: number;
  partner_name: string;
  partner_fertility?: number;
  partner_profile_image_url?: string | null;
  product_image_url: string | null;
  last_message: string;
  unread_count: number;
  updated_at: string;
  my_confirmed: boolean;
  partner_confirmed: boolean;
  is_blocked: boolean;
  i_blocked: boolean;
  blocked_by_partner: boolean;
  // 내가 이 거래의 판매자인지 여부
  is_seller: boolean;
  // 상대방이 채팅방을 나갔는지 여부
  partner_left: boolean;
  // 거래 상품 바 표시용
  product_title?: string;
  product_price?: number;
};

export type ChatListResponse = ApiResponse<ChatListItem[]>;

export type ChatMessageRequest = {
  message: string;
};

export type ChatMessage = {
  message_id: number;
  sender_id: number;
  sender_profile_image_url?: string | null;
  content: string;
  is_read: boolean;
  created_at: string;
};

export type ChatMessagesResponse = ApiResponse<ChatMessage[]>;

export type ChatMessageSendResponse = ApiResponse<ChatMessage>;

export type ChatLeaveResponse = ApiResponse<null>;

export type ChatCompleteDealResponse = ApiResponse<null>;
