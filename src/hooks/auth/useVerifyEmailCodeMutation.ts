import { useMutation } from '@tanstack/react-query';
import { verifyEmailCodeApi } from '@/services/auth';

export function useVerifyEmailCodeMutation() {
  return useMutation({
    mutationFn: verifyEmailCodeApi,
  });
}
