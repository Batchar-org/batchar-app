import { useMutation, useQueryClient } from '@tanstack/react-query';

import { deleteProductApi } from '../../api/product';
import { useAccessToken } from '../../store/useAuthStore';

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
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}
