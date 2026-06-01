import { useMutation, useQueryClient } from '@tanstack/react-query';

import { unblockUserApi } from '@/api/block';

export function useUnblockUserMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (targetUserId: string | number) => unblockUserApi(targetUserId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chatList'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['blockList'] });
    },
  });
}
