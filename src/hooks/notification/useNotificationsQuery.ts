import { useInfiniteQuery } from '@tanstack/react-query';

import { getNotificationsApi } from '@/services/notification';
import useAuthStore, { useIsLoggedIn } from '@/store/useAuthStore';

const PAGE_SIZE = 20;

export function useNotificationsQuery() {
  const isLoggedIn = useIsLoggedIn();

  return useInfiniteQuery({
    queryKey: ['notifications'],
    queryFn: ({ pageParam }) => {
      const token = useAuthStore.getState().accessToken;
      if (!token) throw new Error('로그인이 필요합니다.');
      return getNotificationsApi(pageParam, PAGE_SIZE);
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.data.has_next ? allPages.length : undefined,
    select: (data) => data.pages.flatMap((page) => page.data.content),
    enabled: isLoggedIn,
  });
}
