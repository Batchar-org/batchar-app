import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import type { ApiResponse } from '@/types/common';

type MaterialCommunityIconName = ComponentProps<typeof MaterialCommunityIcons>['name'];

// 상품 카테고리 항목의 형태. 상수는 constants/categories.ts에 있다.
export type ProductCategory = {
  label: string;
  icon: MaterialCommunityIconName;
};

export type ProductCreateRequest = {
  title: string;
  description: string;
  category: string;
  startPrice: number;
  endTime: string;
};

export type ProductViewType =
  | 'ALL'
  | 'BIDDING'
  | 'BID_CLOSED'
  | 'LATEST'
  | 'POPULAR'
  | 'ENDING_SOON'
  | 'MY_PRODUCTS'
  | 'MY_ACTIVE_BIDS'
  | 'MY_BIDS';

export type ProductListParams = {
  view?: ProductViewType;
  category?: string;
  keyword?: string;
  page?: number;
  size?: number;
};

export type ProductSummary = {
  product_id: number;
  title: string;
  media_url: string;
  start_price: number;
  current_price: number;
  my_bid_price: number | null;
  wish_count: number;
  bid_count: number;
  status: string;
  end_time: string;
  is_winner: boolean;
};

export type ProductListResponse = ApiResponse<{
  content: ProductSummary[];
  has_next: boolean;
}>;

export type ProductMediaInfo = {
  id: number;
  url: string;
};

export type ProductDetail = {
  product_id: number;
  seller_id: number;
  seller_name: string;
  seller_profile_image_url?: string | null;
  seller_fertility: number;
  title: string;
  description: string;
  category: string;
  start_price: number;
  current_price: number;
  is_top_bidder: boolean;
  status: string;
  start_time: string;
  end_time: string;
  is_wished: boolean | null;
  wish_count: number;
  bid_count: number;
  media_urls: ProductMediaInfo[];
};

export type ProductDetailResponse = ApiResponse<ProductDetail>;

export type ProductUpdateRequest = {
  title?: string;
  description?: string;
  category?: string;
  endTime?: string;
  deleteMediaIds?: number[];
};

export type ProductCloseResponse = ApiResponse<void>;
