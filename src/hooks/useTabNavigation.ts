// 탭 내비게이션 로직을 캡슐화한 커스텀 훅
// TabBar 컴포넌트에서 사용 중
import { useCallback, useEffect } from 'react';
import { useRouter, usePathname } from 'expo-router';
import { useActiveTab, useTabActions } from '@/store/useTabStore';
import { useIsGuest } from '@/store/useAuthStore';
import { promptLogin } from '@/lib/promptLogin';
import type { TabId } from '@/types/tab';

// 비회원이 접근할 수 없는 탭(로그인 유도)
const PROTECTED_TABS = new Set<TabId>(['heart', 'message', 'profile']);

// 경로 → 탭 ID 매핑
const ROUTE_TO_TAB: Record<string, TabId> = {
  '/': 'home',
  '/productregister': 'plus',
  '/chat': 'message',
  '/mypage': 'profile',
  '/wishlist': 'heart',
};

// 탭 ID → 경로 매핑
const TAB_TO_ROUTE: Partial<Record<TabId, string>> = {
  home: '/',
  plus: '/productregister',
  message: '/chat',
  profile: '/mypage',
  heart: '/wishlist',
};

export function useTabNavigation() {
  const router = useRouter();
  const pathname = usePathname();
  const activeTab = useActiveTab();
  const { setActiveTab } = useTabActions();
  const isGuest = useIsGuest();

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
      // 비회원이 보호 탭을 누르면 로그인 유도
      if (isGuest && PROTECTED_TABS.has(tab)) {
        promptLogin('한밭대학교 구성원만 이용할 수 있는 기능이에요.');
        return;
      }

      // 이미 같은 탭이면 아무 동작 하지 않음
      if (tab === activeTab) return;

      setActiveTab(tab);

      // 해당 탭에 매핑된 경로로 이동.
      // push 대신 navigate를 써서 이미 방문한 탭은 스택을 쌓지 않고 기존 화면으로 되돌아간다.
      const route = TAB_TO_ROUTE[tab];
      if (route) {
        router.navigate(route as any);
      }
    },
    [isGuest, activeTab, setActiveTab, router]
  );

  return {
    activeTab,
    handleTabPress,
  };
}
