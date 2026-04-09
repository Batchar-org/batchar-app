import { useMutation } from '@tanstack/react-query';
import { checkNicknameDuplicateApi } from '@/api/auth';

export function useCheckNicknameDuplicateMutation() {
  return useMutation({
    mutationFn: checkNicknameDuplicateApi,
  });
}
