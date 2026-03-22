import { create } from 'zustand';
import { devtools, combine } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

// ──────────────────────────────────────────────────────────────────
// [TODO] 실제 토큰 연동 시 아래 단계 적용:
//  1. `persist` 미들웨어 추가 (zustand/middleware)
//  2. storage: AsyncStorage (from @react-native-async-storage/async-storage)
//  3. initialState에 token: string | null 필드 추가
//  4. setToken / clearToken 액션 추가
// ──────────────────────────────────────────────────────────────────

const initialState = {
  // 로그인 여부 — 토큰 구현 전 임시 boolean 플래그
  isLoggedIn: false,
};

const useAuthStore = create(
  devtools(
    immer(
      combine(initialState, (set) => ({
        actions: {
          // 로그인 처리 (추후 토큰 저장 로직 추가)
          login: () =>
            set((state) => {
              state.isLoggedIn = true;
            }),

          // 로그아웃 처리 (추후 토큰 삭제 로직 추가)
          logout: () =>
            set((state) => {
              state.isLoggedIn = false;
            }),
        },
      }))
    ),
    { name: 'AuthStore' }
  )
);

// 리렌더링 최적화를 위한 선택적 구독 커스텀 훅
export const useIsLoggedIn = () => useAuthStore((state) => state.isLoggedIn);

// 액션 훅
export const useAuthActions = () => useAuthStore((state) => state.actions);
