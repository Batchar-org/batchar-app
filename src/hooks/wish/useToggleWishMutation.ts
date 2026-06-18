import { useMutation, useQueryClient } from '@tanstack/react-query';

import { addWishApi, removeWishApi } from '@/services/wish';
import { ProductDetailResponse } from '@/types';
import { useAccessToken } from '@/store/useAuthStore';

type ToggleWishParams = {
  productId: number;
  isWished: boolean;
};

type ToggleWishContext = {
  previousDetail?: ProductDetailResponse;
};

export function useToggleWishMutation() {
  const accessToken = useAccessToken();
  const queryClient = useQueryClient();

  return useMutation<unknown, Error, ToggleWishParams, ToggleWishContext>({
    mutationFn: async ({ productId, isWished }) => {
      if (!accessToken) {
        throw new Error('로그인이 필요합니다.');
      }
      if (isWished) {
        return removeWishApi(productId, accessToken);
      }
      return addWishApi(productId, accessToken);
    },

    // 낙관적 업데이트: API 응답 전에 즉시 UI를 반영하여 사용자 체감 속도 향상
    onMutate: async ({ productId, isWished }) => {
      // 진행 중인 refetch를 취소하여 낙관적 업데이트가 덮어씌워지지 않도록 방지
      await queryClient.cancelQueries({ queryKey: ['product', productId] });
      await queryClient.cancelQueries({ queryKey: ['wishlist'] });

      // 롤백을 위해 이전 상태 스냅샷 저장
      const previousDetail = queryClient.getQueryData<ProductDetailResponse>([
        'product',
        productId,
      ]);

      // 캐시를 즉시 업데이트하여 하트 상태와 찜 수를 반영
      if (previousDetail) {
        queryClient.setQueryData<ProductDetailResponse>(['product', productId], {
          ...previousDetail,
          data: {
            ...previousDetail.data,
            is_wished: !isWished,
            wish_count: previousDetail.data.wish_count + (isWished ? -1 : 1),
          },
        });
      }

      return { previousDetail };
    },

    // 에러 발생 시 스냅샷으로 롤백
    onError: (_error, { productId }, context) => {
      if (context?.previousDetail) {
        queryClient.setQueryData(['product', productId], context.previousDetail);
      }
    },

    // 성공/실패 여부와 관계없이 서버 데이터로 재동기화
    onSettled: (_data, _error, { productId }) => {
      queryClient.invalidateQueries({ queryKey: ['product', productId] });
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}
