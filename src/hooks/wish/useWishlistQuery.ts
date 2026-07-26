import { useQuery } from '@tanstack/react-query';

import { getWishlistApi } from '@/services/wish';
import { WishListParams } from '@/types';
import { useAccessToken, useIsLoggedIn } from '@/store/useAuthStore';
import { wishKeys } from '@/queries/keys';

export function useWishlistQuery(params: WishListParams = {}) {
  const accessToken = useAccessToken();
  const isLoggedIn = useIsLoggedIn();

  return useQuery({
    queryKey: wishKeys.list(params),
    queryFn: () => getWishlistApi(params, accessToken!),
    enabled: isLoggedIn && !!accessToken,
    select: (response) => response.data,
  });
}
