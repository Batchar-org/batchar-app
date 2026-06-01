import { create } from 'zustand';
import { combine, devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { logoutApi, refreshApi } from '@/api/auth';
import {
  getRefreshToken,
  getStoredUserId,
  getStoredUserName,
  removeRefreshToken,
  removeStoredUserId,
  removeStoredUserName,
  setRefreshToken,
  setStoredUserId,
  setStoredUserName,
} from '@/lib/secureStore';

type AuthStatus = 'idle' | 'authenticated' | 'unauthenticated';

type AuthStoreState = {
  userId: number | null;
  userName: string | null;
  accessToken: string | null;
  status: AuthStatus;
  isInitialized: boolean;
  isInitializing: boolean;
};

const initialState: AuthStoreState = {
  userId: null,
  userName: null,
  accessToken: null,
  status: 'idle' as AuthStatus,
  // 초기 세션 복원이 끝나기 전에는 라우팅을 보류합니다.
  isInitialized: false,
  isInitializing: false,
};

const useAuthStore = create(
  devtools(
    immer(
      combine(initialState, (set, get) => ({
        actions: {
          setSession: ({
            userId,
            accessToken,
            userName,
          }: {
            userId: number;
            accessToken: string;
            userName?: string | null;
          }) =>
            set((state) => {
              state.userId = userId;
              state.accessToken = accessToken;
              state.status = 'authenticated';
              if (userName !== undefined) state.userName = userName;
            }),

          // 401 → refresh 후 새 access 토큰을 메모리에 반영 (api/client.ts에서 호출)
          setAccessToken: (accessToken: string) =>
            set((state) => {
              state.accessToken = accessToken;
              state.status = 'authenticated';
            }),

          clearSession: () =>
            set((state) => {
              state.userId = null;
              state.userName = null;
              state.accessToken = null;
              state.status = 'unauthenticated';
            }),

          initializeAuth: async () => {
            const { isInitialized, isInitializing } = get();
            if (isInitialized || isInitializing) return;

            set((state) => {
              state.isInitializing = true;
            });

            try {
              // 앱 재실행 시 저장된 refresh 토큰 + userId로 세션을 복구합니다.
              const refreshToken = await getRefreshToken();
              const storedUserId = await getStoredUserId();
              const storedUserName = await getStoredUserName();

              if (!refreshToken || storedUserId === null) {
                set((state) => {
                  state.userId = null;
                  state.userName = null;
                  state.accessToken = null;
                  state.status = 'unauthenticated';
                  state.isInitialized = true;
                });
                return;
              }

              const response = await refreshApi({ refreshToken });
              // 응답 키는 snake_case (NestJS SnakeCaseInterceptor)
              const { access_token, refresh_token } = response.data;

              // refresh 토큰은 회전(rotate)하므로 항상 최신 값으로 덮어씁니다.
              await setRefreshToken(refresh_token);

              set((state) => {
                state.userId = storedUserId;
                state.userName = storedUserName;
                state.accessToken = access_token;
                state.status = 'authenticated';
                state.isInitialized = true;
              });
            } catch {
              // 세션 복구 실패 시 저장된 토큰을 제거하고 비로그인 상태로 전환합니다.
              await removeRefreshToken();
              await removeStoredUserId();
              await removeStoredUserName();

              set((state) => {
                state.userId = null;
                state.userName = null;
                state.accessToken = null;
                state.status = 'unauthenticated';
                state.isInitialized = true;
              });
            } finally {
              set((state) => {
                state.isInitializing = false;
              });
            }
          },

          logout: async () => {
            try {
              const refreshToken = await getRefreshToken();
              // NestJS logout은 Refresh-Token 헤더로 RT를 받습니다 (api/auth.ts logoutApi).
              if (refreshToken) await logoutApi({ refreshToken });
            } catch {
              // 서버 응답과 무관하게 앱 쪽 세션은 반드시 종료합니다.
            } finally {
              await removeRefreshToken();
              await removeStoredUserId();
              await removeStoredUserName();

              set((state) => {
                state.userId = null;
                state.userName = null;
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

export const useUserId = () => useAuthStore((state) => state.userId);
export const useAuthStatus = () => useAuthStore((state) => state.status);
export const useAccessToken = () => useAuthStore((state) => state.accessToken);
export const useUserName = () => useAuthStore((state) => state.userName);
export const useIsInitialized = () => useAuthStore((state) => state.isInitialized);
export const useIsLoggedIn = () => useAuthStore((state) => state.status === 'authenticated');
export const useAuthActions = () => useAuthStore((state) => state.actions);

export { setStoredUserId, setStoredUserName };
