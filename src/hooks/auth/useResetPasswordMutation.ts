import { useMutation } from '@tanstack/react-query';
import { resetPasswordApi } from '@/services/auth';

export function useResetPasswordMutation() {
  return useMutation({
    mutationFn: resetPasswordApi,
  });
}
