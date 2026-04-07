export type ApiResponse<T> = {
  data: T;
  message: string;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type SignupRequest = {
  email: string;
  password: string;
  name: string;
  address: string;
};

export type CheckNicknameDuplicateRequest = {
  name: string;
};

export type SendEmailCodeRequest = {
  email: string;
};

export type VerifyEmailCodeRequest = {
  email: string;
  code: string;
};

export type RefreshRequest = {
  refreshToken: string;
};

export type LogoutRequest = {
  refreshToken: string;
};

export type AuthTokenPayload = {
  userId: number;
  accessToken: string;
  refreshToken: string;
};

export type LoginResponse = ApiResponse<AuthTokenPayload>;
export type SignupResponse = ApiResponse<AuthTokenPayload>;

export type RefreshResponse = ApiResponse<{
  accessToken: string;
  refreshToken: string;
}>;

export type SendEmailCodeResponse = ApiResponse<string>;
export type CheckNicknameDuplicateResponse = ApiResponse<null>;

export type VerifyEmailCodeResponse = ApiResponse<{
  email: string;
}>;

export type LogoutResponse = ApiResponse<string>;

// ── Product ──

export type ProductCreateRequest = {
  title: string;
  description: string;
  category: string;
  startPrice: number;
  endTime: string;
};

export type ProductCreateResponse = ApiResponse<{ product_id: number }>;

export type ProductViewType =
  | 'ALL'
  | 'LATEST'
  | 'POPULAR'
  | 'ENDING_SOON'
  | 'MY_PRODUCTS'
  | 'MY_BIDS';

export type ProductListParams = {
  view?: ProductViewType;
  category?: string;
  page?: number;
  size?: number;
};

export type ProductSummary = {
  product_id: number;
  title: string;
  media_url: string;
  current_price: number;
  wish_count: number;
  bid_count: number;
  status: string;
  end_time: string;
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

// ── Wish ──

export type WishSummary = {
  wish_id: number;
  product_id: number;
  title: string;
  category: string;
  current_price: number;
  end_time: string;
  media_url: string;
  wished_at: string;
};

export type WishListParams = {
  page?: number;
  size?: number;
};

export type WishListResponse = ApiResponse<{
  content: WishSummary[];
  has_next: boolean;
}>;

export type WishAddResponse = ApiResponse<{ wish_id: number }>;
export type WishRemoveResponse = ApiResponse<null>;

// ── Product Update/Delete ──

export type ProductUpdateRequest = {
  title?: string;
  description?: string;
  category?: string;
  endTime?: string;
  deleteMediaIds?: number[];
};

export type ProductUpdateResponse = ProductDetailResponse;

export type ProductDeleteResponse = ApiResponse<{ product_id: number }>;
