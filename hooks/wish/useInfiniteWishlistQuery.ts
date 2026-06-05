import { useInfiniteQuery } from '@tanstack/react-query';

import { getWishlistApi } from '@/api/wish';
import { useAccessToken, useIsLoggedIn } from '@/store/useAuthStore';

const WISHLIST_PAGE_SIZE = 10;

export function useInfiniteWishlistQuery() {
  const accessToken = useAccessToken();
  const isLoggedIn = useIsLoggedIn();

  return useInfiniteQuery({
    queryKey: ['wishlist', 'infinite'],
    queryFn: ({ pageParam }) => {
      if (!accessToken) throw new Error('로그인이 필요합니다.');
      return getWishlistApi({ page: pageParam, size: WISHLIST_PAGE_SIZE }, accessToken);
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.data.has_next ? allPages.length : undefined,
    select: (data) => data.pages.flatMap((page) => page.data.content),
    enabled: isLoggedIn && !!accessToken,
  });
}
