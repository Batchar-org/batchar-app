import { useMutation } from '@tanstack/react-query';
import { sendEmailCodeApi } from '@/services/auth';

export function useSendEmailCodeMutation() {
  return useMutation({
    mutationFn: sendEmailCodeApi,
  });
}
