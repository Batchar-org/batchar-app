import { create } from 'zustand';
import { combine, devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { logoutApi, refreshApi } from '../api/auth';
import {
  getRefreshToken,
  getStoredUserId,
  removeRefreshToken,
  removeStoredUserId,
  setRefreshToken,
} from '../lib/secureStore';

type AuthStatus = 'idle' | 'authenticated' | 'unauthenticated';

type AuthStoreState = {
  userId: number | null;
  accessToken: string | null;
  status: AuthStatus;
  isInitialized: boolean;
};

const initialState: AuthStoreState = {
  userId: null,
  accessToken: null,
  status: 'idle' as AuthStatus,
  // 초기 세션 복원이 끝나기 전에는 라우팅을 보류합니다.
  isInitialized: false,
};

const useAuthStore = create(
  devtools(
    immer(
      combine(initialState, (set) => ({
        actions: {
          setSession: ({ userId, accessToken }: { userId: number; accessToken: string }) =>
            set((state) => {
              state.userId = userId;
              state.accessToken = accessToken;
              state.status = 'authenticated';
            }),

          clearSession: () =>
            set((state) => {
              state.userId = null;
              state.accessToken = null;
              state.status = 'unauthenticated';
            }),

          initializeAuth: async () => {
            try {
              // 앱 재실행 시에는 저장된 RT와 userId로 세션을 복구합니다.
              const refreshToken = await getRefreshToken();
              const storedUserId = await getStoredUserId();

              if (!refreshToken || storedUserId === null) {
                set((state) => {
                  state.userId = null;
                  state.accessToken = null;
                  state.status = 'unauthenticated';
                  state.isInitialized = true;
                });
                return;
              }

              const response = await refreshApi({ refreshToken });
              const { accessToken, refreshToken: nextRefreshToken } = response.data;

              // refresh 응답의 RT는 항상 최신 값으로 교체합니다.
              await setRefreshToken(nextRefreshToken);

              set((state) => {
                state.userId = storedUserId;
                state.accessToken = accessToken;
                state.status = 'authenticated';
                state.isInitialized = true;
              });
            } catch {
              // 세션 복구에 실패하면 저장된 RT를 제거하고 비로그인 상태로 전환합니다.
              await removeRefreshToken();
              await removeStoredUserId();

              set((state) => {
                state.userId = null;
                state.accessToken = null;
                state.status = 'unauthenticated';
                state.isInitialized = true;
              });
            }
          },

          logout: async () => {
            try {
              const refreshToken = await getRefreshToken();

              if (refreshToken) {
                await logoutApi({ refreshToken });
              }
            } catch {
              // 서버 응답과 무관하게 앱 쪽 세션은 반드시 종료합니다.
            } finally {
              await removeRefreshToken();
              await removeStoredUserId();

              set((state) => {
                state.userId = null;
                state.accessToken = null;
                state.status = 'unauthenticated';
              });
            }
          },
        },
      }))
    ),
    { name: 'AuthStore' }
  )
);

export default useAuthStore;

export const useAuthStatus = () => useAuthStore((state) => state.status);
export const useAccessToken = () => useAuthStore((state) => state.accessToken);
export const useIsInitialized = () => useAuthStore((state) => state.isInitialized);
export const useIsLoggedIn = () => useAuthStore((state) => state.status === 'authenticated');
export const useAuthActions = () => useAuthStore((state) => state.actions);
