import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import EventSource from 'react-native-sse';

import { ProductDetailResponse } from '@/types';

const BASE_URL = (process.env.EXPO_PUBLIC_API_BASE_URL ?? '').trim().replace(/\/+$/, '');

type UseProductSSEOptions = {
  productId: number;
  enabled?: boolean;
};

export function useProductSSE({ productId, enabled = true }: UseProductSSEOptions) {
  const queryClient = useQueryClient();
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (!enabled || productId <= 0 || !BASE_URL) return;

    const url = `${BASE_URL}/api/products/${productId}/subscribe`;
    const eventSource = new EventSource(url);
    eventSourceRef.current = eventSource;

    eventSource.addEventListener('message', (event) => {
      if (!event.data) return;
      try {
        const payload = JSON.parse(event.data);
        // NestJS는 snake_case로 내려준다 (구버전 호환 위해 camelCase도 허용)
        const currentPrice = payload.current_price ?? payload.currentPrice;
        if (currentPrice === undefined || currentPrice === null) return;

        // 상품 상세 캐시 갱신 (현재가, 입찰 수)
        queryClient.setQueryData<ProductDetailResponse>(['product', productId], (old) => {
          if (!old) return old;
          return {
            ...old,
            data: {
              ...old.data,
              current_price: Number(currentPrice),
              bid_count: old.data.bid_count + 1,
            },
          };
        });

        // 입찰 내역 갱신
        queryClient.invalidateQueries({ queryKey: ['bidHistory', productId] });
      } catch (e) {
        console.warn('[SSE] 메시지 파싱 실패:', e);
      }
    });

    eventSource.addEventListener('error', () => {
      // 연결 끊김 시 react-native-sse가 자동 재연결 시도
    });

    return () => {
      eventSource.close();
      eventSourceRef.current = null;
    };
  }, [productId, enabled, queryClient]);
}
