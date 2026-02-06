/**
 * Tab 관련 공통 타입 정의
 */

// 탭 ID 유니온 타입
export type TabId = 'home' | 'heart' | 'plus' | 'message' | 'profile';

// 탭 정보 인터페이스 (TabBar에서 사용)
export interface Tab {
  id: TabId;
  icon: string;
}

// 탭 경로 매핑 타입
export type TabRouteMap = Partial<Record<TabId, string>>;
export type RouteTabMap = Record<string, TabId>;
