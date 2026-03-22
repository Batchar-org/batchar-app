import { useMutation } from '@tanstack/react-query';
import { verifyEmailCodeApi } from '../../api/auth';

export function useVerifyEmailCodeMutation() {
  return useMutation({
    mutationFn: verifyEmailCodeApi,
  });
}
