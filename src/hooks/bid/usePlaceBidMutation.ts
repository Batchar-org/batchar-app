import { useMutation, useQueryClient } from '@tanstack/react-query';

import { placeBidApi } from '@/services/bid';
import { ProductDetailResponse } from '@/types';
import { useAccessToken } from '@/store/useAuthStore';
import { productKeys, bidKeys } from '@/queries/keys';

type PlaceBidParams = {
  productId: number;
  price: number;
};

type PlaceBidContext = {
  previousDetail?: ProductDetailResponse;
};

export function usePlaceBidMutation() {
  const accessToken = useAccessToken();
  const queryClient = useQueryClient();

  return useMutation<void, Error, PlaceBidParams, PlaceBidContext>({
    mutationFn: async ({ productId, price }) => {
      if (!accessToken) {
        throw new Error('로그인이 필요합니다.');
      }
      return placeBidApi(productId, { price }, accessToken);
    },

    onMutate: async ({ productId, price }) => {
      await queryClient.cancelQueries({ queryKey: productKeys.detail(productId) });

      const previousDetail = queryClient.getQueryData<ProductDetailResponse>(
        productKeys.detail(productId)
      );

      if (previousDetail) {
        queryClient.setQueryData<ProductDetailResponse>(productKeys.detail(productId), {
          ...previousDetail,
          data: {
            ...previousDetail.data,
            current_price: price,
            is_top_bidder: true,
            bid_count: previousDetail.data.bid_count + 1,
          },
        });
      }

      return { previousDetail };
    },

    onError: (_error, { productId }, context) => {
      if (context?.previousDetail) {
        queryClient.setQueryData(productKeys.detail(productId), context.previousDetail);
      }
    },

    onSettled: (_data, _error, { productId }) => {
      queryClient.invalidateQueries({ queryKey: productKeys.detail(productId) });
      queryClient.invalidateQueries({ queryKey: bidKeys.byProduct(productId) });
      queryClient.invalidateQueries({ queryKey: productKeys.listAll });
    },
  });
}
