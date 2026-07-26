import { useMutation, useQueryClient } from '@tanstack/react-query';

import { closeProductApi } from '@/services/product';
import { useAccessToken } from '@/store/useAuthStore';
import { productKeys, bidKeys } from '@/queries/keys';

export function useCloseProductMutation() {
  const accessToken = useAccessToken();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productId: number) => {
      if (!accessToken) {
        throw new Error('로그인이 필요합니다.');
      }
      return closeProductApi(productId, accessToken);
    },
    onSuccess: (_data, productId) => {
      queryClient.invalidateQueries({ queryKey: productKeys.detail(productId) });
      queryClient.invalidateQueries({ queryKey: productKeys.listAll });
      queryClient.invalidateQueries({ queryKey: bidKeys.byProduct(productId) });
    },
  });
}
