import { useMutation, useQueryClient } from '@tanstack/react-query';

import { deleteProductApi } from '@/services/product';
import { useAccessToken } from '@/store/useAuthStore';
import { productKeys } from '@/queries/keys';

export function useDeleteProductMutation() {
  const accessToken = useAccessToken();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productId: number) => {
      if (!accessToken) {
        throw new Error('로그인이 필요합니다.');
      }
      return deleteProductApi(productId, accessToken);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.listAll });
    },
  });
}
