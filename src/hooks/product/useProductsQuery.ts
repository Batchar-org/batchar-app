import { useQuery } from '@tanstack/react-query';

import { getProductsApi } from '@/services/product';
import { ProductListParams } from '@/types';
import useAuthStore, { useCanBrowse } from '@/store/useAuthStore';

export function useProductsQuery(params: ProductListParams = {}) {
  const canBrowse = useCanBrowse();

  return useQuery({
    queryKey: ['products', params],
    queryFn: () => {
      const token = useAuthStore.getState().accessToken;
      return getProductsApi(params, token);
    },
    select: (response) => response.data,
    enabled: canBrowse,
    refetchOnWindowFocus: true,
    staleTime: 0,
  });
}
