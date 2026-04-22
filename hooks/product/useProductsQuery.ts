import { useQuery } from '@tanstack/react-query';

import { getProductsApi } from '@/api/product';
import { ProductListParams } from '@/api/types';
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
