import { BidListParams, ProductListParams, WishListParams } from '@/types';

/**
 * TanStack Query queryKey 중앙 관리 (query key factory)
 *
 * 훅의 queryKey 정의와 mutation의 invalidateQueries가 동일한 소스를 참조하도록 하여
 * 오타·불일치를 타입 레벨에서 방지한다.
 *
 * 주의: 각 키의 배열 구조는 기존 하드코딩 값과 정확히 동일하게 유지되어야 한다.
 * 무효화가 prefix 매칭에 의존하기 때문. (예: ['products']는 ['products', params]와
 * ['products', 'infinite', params]를 모두 무효화한다.)
 */

type InfiniteProductParams = Omit<ProductListParams, 'page' | 'size'>;

export const productKeys = {
  // 상품 상세 ['product', ...] — 목록(['products'])과는 별개 네임스페이스
  detailAll: ['product'] as const,
  detail: (productId: number) => ['product', productId] as const,

  // 상품 목록 ['products', ...]
  listAll: ['products'] as const,
  list: (params: ProductListParams) => ['products', params] as const,
  infiniteList: (params: InfiniteProductParams) => ['products', 'infinite', params] as const,
};

export const chatKeys = {
  list: ['chatList'] as const,
  messages: (chatId: number) => ['chatMessages', chatId] as const,
};

export const notificationKeys = {
  all: ['notifications'] as const,
  unreadCount: ['notifications', 'unread-count'] as const,
  settings: ['notification-settings'] as const,
};

export const wishKeys = {
  all: ['wishlist'] as const,
  list: (params: WishListParams) => ['wishlist', params] as const,
  infinite: ['wishlist', 'infinite'] as const,
};

export const userKeys = {
  profile: ['userProfile'] as const,
};

export const bidKeys = {
  // 특정 상품의 입찰 내역 전체 ['bidHistory', productId] — 무효화용
  byProduct: (productId: number) => ['bidHistory', productId] as const,
  history: (productId: number, params: BidListParams) => ['bidHistory', productId, params] as const,
};

export const blockKeys = {
  list: ['blockList'] as const,
};
