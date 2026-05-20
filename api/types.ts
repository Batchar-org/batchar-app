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
  userId: string;
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
export type CheckEmailDuplicateRequest = {
  email: string;
};
export type CheckEmailDuplicateResponse = ApiResponse<null>;

export type VerifyEmailCodeResponse = ApiResponse<{
  email: string;
}>;

export type LogoutResponse = ApiResponse<string>;

export type PasswordResetRequest = {
  email: string;
};

export type PasswordResetResponse = ApiResponse<null>;

// ── User ──

export type UserProfile = {
  user_id: string;
  email: string;
  name: string;
  address: string;
  profile_image_url: string | null;
};

export type UserProfileResponse = ApiResponse<UserProfile>;

export type UpdateUserProfileRequest = {
  name?: string;
  address?: string;
};

export type UpdateUserProfileResponse = ApiResponse<UserProfile>;

export type DeleteUserResponse = ApiResponse<null>;

export type UpdateProfileImageResponse = ApiResponse<UserProfile>;
export type DeleteProfileImageResponse = ApiResponse<null>;

export type PasswordVerifyRequest = {
  password: string;
};

export type PasswordVerifyResponse = ApiResponse<null>;

export type ChangePasswordRequest = {
  current_password: string;
  new_password: string;
};

export type ChangePasswordResponse = ApiResponse<null>;

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
  keyword?: string;
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
  seller_id: string;
  seller_name: string;
  seller_profile_image_url?: string | null;
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

export type ProductCloseResponse = ApiResponse<void>;

// ── Bid ──

export type BidCreateRequest = {
  price: number;
};

export type BidCreateResponse = ApiResponse<{
  bid_id: number;
  product_id: number;
  bidder_id: string;
  price: number;
  created_at: string;
}>;

export type BidSummary = {
  bid_id: number;
  bidder_name: string;
  price: number;
  status: 'ACTIVE' | 'WON';
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

// ── Storage ──

export type PresignedUrlRequest = {
  fileName: string;
  contentType: string;
};

export type PresignedUrlResponse = ApiResponse<{
  presignedUrl: string;
  objectUrl: string;
}>;

// ── Chat ──

export type ChatListItem = {
  chat_id: number;
  product_id: number;
  partner_name: string;
  product_image_url: string;
  last_message: string;
  unread_count: number;
  updated_at: string;
  my_confirmed: boolean;
  partner_confirmed: boolean;
};

export type ChatListResponse = ApiResponse<ChatListItem[]>;

export type ChatMessageRequest = {
  message: string;
};

export type ChatMessage = {
  message_id: number;
  sender_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
};

export type ChatMessagesResponse = ApiResponse<ChatMessage[]>;

export type ChatMessageSendResponse = ApiResponse<ChatMessage>;

export type ChatLeaveResponse = ApiResponse<null>;

export type ChatCompleteDealResponse = ApiResponse<null>;

export type ChatMediaMessage = {
  message_id: number;
  sender_id: string;
  content: string;
  media_url: string;
  media_type: 'IMAGE' | 'VIDEO';
  is_read: boolean;
  created_at: string;
};

export type ChatMediaSendResponse = ApiResponse<ChatMediaMessage>;
