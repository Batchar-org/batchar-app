import { useQuery } from '@tanstack/react-query';

import { getProductsApi } from '@/services/product';
import { ProductListParams } from '@/types';
import useAuthStore, { useIsLoggedIn } from '@/store/useAuthStore';

export function useProductsQuery(params: ProductListParams = {}) {
  const isLoggedIn = useIsLoggedIn();

  return useQuery({
    queryKey: ['products', params],
    queryFn: () => {
      const token = useAuthStore.getState().accessToken;
      return getProductsApi(params, token);
    },
    select: (response) => response.data,
    enabled: isLoggedIn,
    refetchOnWindowFocus: true,
    staleTime: 0,
  });
}
