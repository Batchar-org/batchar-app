import { useQuery } from '@tanstack/react-query';

import { getWishlistApi } from '@/services/wish';
import { WishListParams } from '@/types';
import { useAccessToken, useIsLoggedIn } from '@/store/useAuthStore';

export function useWishlistQuery(params: WishListParams = {}) {
  const accessToken = useAccessToken();
  const isLoggedIn = useIsLoggedIn();

  return useQuery({
    queryKey: ['wishlist', params],
    queryFn: () => getWishlistApi(params, accessToken!),
    enabled: isLoggedIn && !!accessToken,
    select: (response) => response.data,
  });
}
