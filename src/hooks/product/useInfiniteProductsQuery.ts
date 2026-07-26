import { useInfiniteQuery } from '@tanstack/react-query';

import { getProductsApi } from '@/services/product';
import { ProductListParams } from '@/types';
import useAuthStore, { useCanBrowse } from '@/store/useAuthStore';
import { productKeys } from '@/queries/keys';

const PRODUCT_PAGE_SIZE = 10;

type InfiniteProductParams = Omit<ProductListParams, 'page' | 'size'>;

export function useInfiniteProductsQuery(params: InfiniteProductParams = {}) {
  const canBrowse = useCanBrowse();

  return useInfiniteQuery({
    queryKey: productKeys.infiniteList(params),
    queryFn: ({ pageParam }) => {
      const token = useAuthStore.getState().accessToken;
      return getProductsApi({ ...params, page: pageParam, size: PRODUCT_PAGE_SIZE }, token);
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.data.has_next ? allPages.length : undefined,
    select: (data) => data.pages.flatMap((page) => page.data.content),
    enabled: canBrowse,
    refetchOnWindowFocus: true,
    staleTime: 0,
  });
}
