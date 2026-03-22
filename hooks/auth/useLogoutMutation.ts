import { useMutation } from '@tanstack/react-query';
import { useAuthActions } from '../../store/useAuthStore';

export function useLogoutMutation() {
  const { logout } = useAuthActions();

  return useMutation({
    mutationFn: logout,
  });
}
