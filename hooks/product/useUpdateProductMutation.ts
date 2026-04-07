import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ImagePickerAsset } from 'expo-image-picker';

import { updateProductApi } from '../../api/product';
import { ProductUpdateRequest } from '../../api/types';
import { useAccessToken } from '../../store/useAuthStore';

type UpdateProductParams = {
  productId: number;
  request: ProductUpdateRequest;
  files: ImagePickerAsset[];
};

export function useUpdateProductMutation() {
  const accessToken = useAccessToken();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ productId, request, files }: UpdateProductParams) => {
      if (!accessToken) {
        throw new Error('로그인이 필요합니다.');
      }
      return updateProductApi(productId, request, files, accessToken);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['product', variables.productId] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}
