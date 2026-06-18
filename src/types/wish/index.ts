import type { ApiResponse } from '@/types/common';

export type WishSummary = {
  wish_id: number;
  product_id: number;
  title: string;
  start_price: number;
  current_price: number;
  bid_count: number;
  status: string;
  end_time: string;
  media_url: string;
  // NestJS WishSummary에는 category가 없음(백엔드 추가 시 채워짐).
  category?: string;
};

export type WishListParams = {
  page?: number;
  size?: number;
};

export type WishListResponse = ApiResponse<{
  content: WishSummary[];
  has_next: boolean;
}>;

export type WishAddResponse = ApiResponse<null>;
export type WishRemoveResponse = ApiResponse<null>;
