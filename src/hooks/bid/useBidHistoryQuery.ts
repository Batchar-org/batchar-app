import { useQuery } from '@tanstack/react-query';

import { getBidHistoryApi } from '@/services/bid';
import { BidListParams } from '@/types';
import useAuthStore, { useIsLoggedIn } from '@/store/useAuthStore';

export function useBidHistoryQuery(productId: number, params: BidListParams = {}) {
  const isLoggedIn = useIsLoggedIn();

  return useQuery({
    queryKey: ['bidHistory', productId, params],
    queryFn: () => {
      const token = useAuthStore.getState().accessToken;
      return getBidHistoryApi(productId, params, token);
    },
    select: (response) => response.data,
    enabled: productId > 0 && isLoggedIn,
  });
}
