import { useQuery } from '@tanstack/react-query';

import { getProductDetailApi } from '@/services/product';
import useAuthStore, { useCanBrowse } from '@/store/useAuthStore';

export function useProductDetailQuery(productId: number) {
  const canBrowse = useCanBrowse();

  return useQuery({
    queryKey: ['product', productId],
    queryFn: () => {
      const token = useAuthStore.getState().accessToken;
      return getProductDetailApi(productId, token);
    },
    select: (response) => response.data,
    enabled: productId > 0 && canBrowse,
  });
}
