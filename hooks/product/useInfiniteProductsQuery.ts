import { useInfiniteQuery } from '@tanstack/react-query';

import { getProductsApi } from '@/api/product';
import { ProductListParams } from '@/api/types';
import useAuthStore, { useIsLoggedIn } from '@/store/useAuthStore';

const PRODUCT_PAGE_SIZE = 10;

type InfiniteProductParams = Omit<ProductListParams, 'page' | 'size'>;

export function useInfiniteProductsQuery(params: InfiniteProductParams = {}) {
  const isLoggedIn = useIsLoggedIn();

  return useInfiniteQuery({
    queryKey: ['products', 'infinite', params],
    queryFn: ({ pageParam }) => {
      const token = useAuthStore.getState().accessToken;
      return getProductsApi({ ...params, page: pageParam, size: PRODUCT_PAGE_SIZE }, token);
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.data.has_next ? allPages.length : undefined,
    select: (data) => data.pages.flatMap((page) => page.data.content),
    enabled: isLoggedIn,
    refetchOnWindowFocus: true,
    staleTime: 0,
  });
}
