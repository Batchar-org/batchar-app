import { useMutation } from '@tanstack/react-query';
import { sendEmailCodeApi } from '@/api/auth';

export function useSendEmailCodeMutation() {
  return useMutation({
    mutationFn: sendEmailCodeApi,
  });
}
