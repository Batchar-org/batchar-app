import { useMutation } from '@tanstack/react-query';
import { resetPasswordApi } from '@/api/auth';

export function useResetPasswordMutation() {
  return useMutation({
    mutationFn: resetPasswordApi,
  });
}
