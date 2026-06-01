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

// 응답 키는 snake_case (NestJS SnakeCaseInterceptor). userId는 number(bigint).
export type AuthTokenPayload = {
  user_id: number;
  access_token: string;
  refresh_token: string;
};

export type LoginResponse = ApiResponse<AuthTokenPayload>;
export type SignupResponse = ApiResponse<AuthTokenPayload>;

export type RefreshResponse = ApiResponse<{
  access_token: string;
  refresh_token: string;
}>;

export type SendEmailCodeResponse = ApiResponse<null>;
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
  user_id: number;
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

export type DeleteUserResponse = ApiResponse<null>;

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
  seller_id: number;
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
  current_price: number;
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

// ── Product Update/Delete ──

export type ProductUpdateRequest = {
  title?: string;
  description?: string;
  category?: string;
  endTime?: string;
  deleteMediaIds?: number[];
};

export type ProductCloseResponse = ApiResponse<void>;

// ── Bid ──

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

// ── Chat ──

export type ChatListItem = {
  chat_id: number;
  product_id: number;
  // NestJS ChatListResponse DTO에는 현재 partner_id가 없음(백엔드 추가 권장). 차단/신고 연동에 필요.
  partner_id?: number;
  partner_name: string;
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
  hidden?: boolean;
  created_at: string;
};

export type ChatMessagesResponse = ApiResponse<ChatMessage[]>;

export type ChatMessageSendResponse = ApiResponse<ChatMessage>;

export type ChatLeaveResponse = ApiResponse<null>;

export type ChatCompleteDealResponse = ApiResponse<null>;

// ── Report ──

export type ReportReasonCode = 'SPAM' | 'ABUSE' | 'FRAUD' | 'INAPPROPRIATE_CONTENT' | 'ETC';

export type ReportRequestBase = {
  reason: ReportReasonCode;
  description?: string;
};

export type ReportUserRequest = ReportRequestBase & { targetUserId: number };
export type ReportProductRequest = ReportRequestBase & { targetProductId: number };
export type ReportMessageRequest = ReportRequestBase & { targetMessageId: number };

export type ReportResponse = ApiResponse<{ report_id: number }>;

// ── Block ──

export type BlockSummary = {
  block_id: number;
  blocked_id: number;
  blocked_name: string;
  blocked_profile_image_url: string | null;
  created_at: string;
};

export type BlockListResponse = ApiResponse<BlockSummary[]>;
export type BlockAddResponse = ApiResponse<{ block_id: number }>;
export type BlockRemoveResponse = ApiResponse<null>;
