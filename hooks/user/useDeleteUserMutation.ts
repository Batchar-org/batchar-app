import { useMutation } from '@tanstack/react-query';

import { deleteUserApi } from '@/api/user';

export function useDeleteUserMutation() {
  return useMutation({
    mutationFn: () => deleteUserApi(),
  });
}
