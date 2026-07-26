import { useQuery } from '@tanstack/react-query';

import { getBidHistoryApi } from '@/services/bid';
import { BidListParams } from '@/types';
import useAuthStore, { useCanBrowse } from '@/store/useAuthStore';
import { bidKeys } from '@/queries/keys';

export function useBidHistoryQuery(productId: number, params: BidListParams = {}) {
  const canBrowse = useCanBrowse();

  return useQuery({
    queryKey: bidKeys.history(productId, params),
    queryFn: () => {
      const token = useAuthStore.getState().accessToken;
      return getBidHistoryApi(productId, params, token);
    },
    select: (response) => response.data,
    enabled: productId > 0 && canBrowse,
  });
}
