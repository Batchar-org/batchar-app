import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import { productKeys, wishKeys } from '@/queries/keys';

/**
 * 홈 화면 pull-to-refresh: 상품 목록과 찜 목록 캐시를 무효화한다.
 * 화면이 queryKey를 직접 알지 않도록 캐시 조작을 훅으로 흡수.
 */
export function useRefreshHome() {
  const queryClient = useQueryClient();

  return useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: productKeys.listAll });
    await queryClient.invalidateQueries({ queryKey: wishKeys.all });
  }, [queryClient]);
}
