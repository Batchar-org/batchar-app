import type { ApiResponse } from '@/types/common';

export type BidCreateRequest = {
  price: number;
};

export type BidSummary = {
  bidder_name: string;
  price: number;
  created_at: string;
};

export type BidListParams = {
  page?: number;
  size?: number;
};

export type BidListResponse = ApiResponse<{
  content: BidSummary[];
  has_next: boolean;
}>;
