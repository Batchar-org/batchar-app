import { useMutation, useQueryClient } from '@tanstack/react-query';
import { reactFertilityApi } from '@/services/fertility';
import type { FertilityAction } from '@/types';

// 물 주기/산성비 평가 뮤테이션. 성공 시 상대 비옥도가 바뀌므로 상품 상세 캐시를 무효화한다.
export function useFertilityReactionMutation() {
  const queryClient = useQueryClient();

  return useMutation<{ fertility: number }, Error, { chatId: number; action: FertilityAction }>({
    mutationFn: ({ chatId, action }) => reactFertilityApi(chatId, action),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['product'] });
    },
  });
}
