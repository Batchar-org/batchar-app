import { useQuery } from '@tanstack/react-query';

import { getProductsApi } from '@/services/product';
import { ProductListParams } from '@/types';
import useAuthStore, { useCanBrowse } from '@/store/useAuthStore';
import { productKeys } from '@/queries/keys';

export function useProductsQuery(params: ProductListParams = {}) {
  const canBrowse = useCanBrowse();

  return useQuery({
    queryKey: productKeys.list(params),
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
