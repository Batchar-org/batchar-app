// 탭 내비게이션 로직을 캡슐화한 커스텀 훅
// TabBar 컴포넌트에서 사용 중
import { useCallback, useEffect } from 'react';
import { useRouter, usePathname } from 'expo-router';
import { useActiveTab, useTabActions } from '../stores/useTabStore';
import type { TabId } from '../types/tab';

// 경로 → 탭 ID 매핑
const ROUTE_TO_TAB: Record<string, TabId> = {
  '/': 'home',
  '/register': 'plus',
  // 추후 다른 탭 경로 추가
  // '/wishlist': 'heart',
  // '/chat': 'message',
  // '/profile': 'profile',
};

// 탭 ID → 경로 매핑
const TAB_TO_ROUTE: Partial<Record<TabId, string>> = {
  home: '/',
  plus: '/register',
  // 추후 다른 탭 경로 추가
  // heart: '/wishlist',
  // message: '/chat',
  // profile: '/profile',
};

export function useTabNavigation() {
  const router = useRouter();
  const pathname = usePathname();
  const activeTab = useActiveTab();
  const { setActiveTab } = useTabActions();

  // 현재 경로에 따라 activeTab 자동 동기화
  useEffect(() => {
    const tabFromRoute = ROUTE_TO_TAB[pathname];
    if (tabFromRoute && tabFromRoute !== activeTab) {
      setActiveTab(tabFromRoute);
    }
  }, [pathname, activeTab, setActiveTab]);

  // 탭 클릭 핸들러
  const handleTabPress = useCallback(
    (tab: TabId) => {
      // 이미 같은 탭이면 아무 동작 하지 않음
      if (tab === activeTab) return;

      setActiveTab(tab);

      // 해당 탭에 매핑된 경로가 있으면 이동
      const route = TAB_TO_ROUTE[tab];
      if (route) {
        router.push(route as any);
      }
    },
    [activeTab, setActiveTab, router]
  );

  return {
    activeTab,
    handleTabPress,
  };
}
