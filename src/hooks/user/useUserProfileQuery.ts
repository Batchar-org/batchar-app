import { useQuery } from '@tanstack/react-query';

import { getUserProfileApi } from '@/services/user';
import useAuthStore, { useIsLoggedIn } from '@/store/useAuthStore';

export function useUserProfileQuery() {
  const isLoggedIn = useIsLoggedIn();

  return useQuery({
    queryKey: ['userProfile'],
    queryFn: () => {
      const token = useAuthStore.getState().accessToken;
      if (!token) throw new Error('인증 토큰이 없습니다.');
      return getUserProfileApi(token);
    },
    select: (response) => response.data,
    enabled: isLoggedIn,
  });
}
