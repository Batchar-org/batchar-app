import { useMutation, useQueryClient } from '@tanstack/react-query';

import { blockUserApi } from '@/services/block';
import { chatKeys, productKeys, blockKeys } from '@/queries/keys';

export function useBlockUserMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (targetUserId: string | number) => blockUserApi(targetUserId),
    onSuccess: () => {
      // 차단 후 영향받는 캐시들 무효화 (상품 목록, 채팅 목록, 차단 목록 등)
      queryClient.invalidateQueries({ queryKey: chatKeys.list });
      queryClient.invalidateQueries({ queryKey: productKeys.listAll });
      queryClient.invalidateQueries({ queryKey: blockKeys.list });
    },
  });
}
