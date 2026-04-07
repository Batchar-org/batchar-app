import { useMutation, useQueryClient } from '@tanstack/react-query';

import { placeBidApi } from '../../api/bid';
import { BidCreateResponse, ProductDetailResponse } from '../../api/types';
import { useAccessToken } from '../../store/useAuthStore';

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

  return useMutation<BidCreateResponse, Error, PlaceBidParams, PlaceBidContext>({
    mutationFn: async ({ productId, price }) => {
      if (!accessToken) {
        throw new Error('로그인이 필요합니다.');
      }
      return placeBidApi(productId, { price }, accessToken);
    },

    onMutate: async ({ productId, price }) => {
      await queryClient.cancelQueries({ queryKey: ['product', productId] });

      const previousDetail = queryClient.getQueryData<ProductDetailResponse>([
        'product',
        productId,
      ]);

      if (previousDetail) {
        queryClient.setQueryData<ProductDetailResponse>(['product', productId], {
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
        queryClient.setQueryData(['product', productId], context.previousDetail);
      }
    },

    onSettled: (_data, _error, { productId }) => {
      queryClient.invalidateQueries({ queryKey: ['product', productId] });
      queryClient.invalidateQueries({ queryKey: ['bidHistory', productId] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}
