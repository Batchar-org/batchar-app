import { useMutation } from '@tanstack/react-query';
import { ImagePickerAsset } from 'expo-image-picker';

import { createProductApi } from '@/api/product';
import { ProductCreateRequest } from '@/api/types';
import { useAccessToken } from '@/store/useAuthStore';

type CreateProductParams = {
  request: ProductCreateRequest;
  files: ImagePickerAsset[];
};

export function useCreateProductMutation() {
  const accessToken = useAccessToken();

  return useMutation({
    mutationFn: ({ request, files }: CreateProductParams) => {
      if (!accessToken) {
        throw new Error('로그인이 필요합니다.');
      }
      return createProductApi(request, files, accessToken);
    },
  });
}
