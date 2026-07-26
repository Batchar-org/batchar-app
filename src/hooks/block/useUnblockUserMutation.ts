import { useMutation, useQueryClient } from '@tanstack/react-query';

import { unblockUserApi } from '@/services/block';
import { chatKeys, productKeys, blockKeys } from '@/queries/keys';

export function useUnblockUserMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (targetUserId: string | number) => unblockUserApi(targetUserId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: chatKeys.list });
      queryClient.invalidateQueries({ queryKey: productKeys.listAll });
      queryClient.invalidateQueries({ queryKey: blockKeys.list });
    },
  });
}
