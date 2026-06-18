import { useMutation } from '@tanstack/react-query';

import { deleteUserApi } from '@/services/user';

export function useDeleteUserMutation() {
  return useMutation({
    mutationFn: () => deleteUserApi(),
  });
}
