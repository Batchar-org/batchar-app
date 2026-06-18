import { useMutation } from '@tanstack/react-query';
import { checkEmailDuplicateApi } from '@/services/auth';

export function useCheckEmailDuplicateMutation() {
  return useMutation({
    mutationFn: checkEmailDuplicateApi,
  });
}
