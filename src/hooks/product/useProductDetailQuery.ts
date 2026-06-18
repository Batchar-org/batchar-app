import { useQuery } from '@tanstack/react-query';

import { getProductDetailApi } from '@/services/product';
import useAuthStore, { useIsLoggedIn } from '@/store/useAuthStore';

export function useProductDetailQuery(productId: number) {
  const isLoggedIn = useIsLoggedIn();

  return useQuery({
    queryKey: ['product', productId],
    queryFn: () => {
      const token = useAuthStore.getState().accessToken;
      return getProductDetailApi(productId, token);
    },
    select: (response) => response.data,
    enabled: productId > 0 && isLoggedIn,
  });
}
