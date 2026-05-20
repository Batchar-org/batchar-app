import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import { ProductDetailResponse } from '@/api/types';
import { supabase } from '@/lib/supabase';

type UseProductRealtimeOptions = {
  productId: number;
  enabled?: boolean;
};

type BidRow = { id: number; product_id: number; price: number };
type ProductRow = { id: number; current_price: number };

// Supabase Realtime 기반 상품 입찰/현재가 구독 훅.
// `bids` INSERT + `products` UPDATE 두 이벤트를 구독해 상세 캐시와 입찰 내역을 갱신합니다.
export function useProductRealtime({ productId, enabled = true }: UseProductRealtimeOptions) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!enabled || productId <= 0) return;

    // Fast Refresh/StrictMode 더블 마운트 대비 고유한 채널 이름 사용
    const channelName = `product:${productId}:${Date.now()}:${Math.random().toString(36).slice(2)}`;

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'bids',
          filter: `product_id=eq.${productId}`,
        },
        (payload) => {
          const row = payload.new as BidRow;
          queryClient.setQueryData<ProductDetailResponse>(['product', productId], (old) => {
            if (!old) return old;
            return {
              ...old,
              data: {
                ...old.data,
                current_price: row.price,
                bid_count: old.data.bid_count + 1,
              },
            };
          });
          queryClient.invalidateQueries({ queryKey: ['bidHistory', productId] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'products',
          filter: `id=eq.${productId}`,
        },
        (payload) => {
          const row = payload.new as ProductRow;
          queryClient.setQueryData<ProductDetailResponse>(['product', productId], (old) => {
            if (!old) return old;
            return {
              ...old,
              data: { ...old.data, current_price: row.current_price },
            };
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [productId, enabled, queryClient]);
}
