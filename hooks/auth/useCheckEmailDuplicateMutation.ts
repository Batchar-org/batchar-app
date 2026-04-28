import { useMutation } from '@tanstack/react-query';
import { checkEmailDuplicateApi } from '@/api/auth';

export function useCheckEmailDuplicateMutation() {
  return useMutation({
    mutationFn: checkEmailDuplicateApi,
  });
}
