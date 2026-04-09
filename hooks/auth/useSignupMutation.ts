import { useMutation } from '@tanstack/react-query';
import { signupApi } from '@/api/auth';

export function useSignupMutation() {
  return useMutation({
    // 회원가입은 완료 후 로그인 화면으로 보내므로 세션 저장을 하지 않습니다.
    mutationFn: signupApi,
  });
}
